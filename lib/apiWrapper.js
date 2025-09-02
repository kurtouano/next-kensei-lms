// API wrapper utility for robust database operations with retry logic
import { connectDb, ensureDbConnection } from './mongodb';

/**
 * Wraps database operations with retry logic and error handling
 * @param {Function} operation - The database operation to execute
 * @param {Object} options - Configuration options
 * @returns {Promise} - Result of the operation or throws error after retries
 */
export const withDbOperation = async (operation, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    operationName = 'Database operation'
  } = options;

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Ensure database connection before operation
      await ensureDbConnection();
      
      console.log(`${operationName} - Attempt ${attempt}/${maxRetries}`);
      
      // Execute the operation
      const result = await operation();
      
      if (attempt > 1) {
        console.log(`✅ ${operationName} succeeded on retry attempt ${attempt}`);
      }
      
      return result;
      
    } catch (error) {
      lastError = error;
      console.error(`❌ ${operationName} failed on attempt ${attempt}:`, error.message);
      
      // Don't retry certain types of errors
      if (isNonRetryableError(error)) {
        console.log(`🚫 Non-retryable error detected, stopping retries`);
        throw error;
      }
      
      if (attempt === maxRetries) {
        console.error(`💥 ${operationName} failed after ${maxRetries} attempts`);
        throw new Error(`${operationName} failed after ${maxRetries} attempts. Last error: ${error.message}`);
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 500;
      console.log(`⏳ Waiting ${delay.toFixed(0)}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Checks if an error should not be retried
 * @param {Error} error - The error to check
 * @returns {boolean} - True if the error should not be retried
 */
const isNonRetryableError = (error) => {
  const nonRetryablePatterns = [
    'unauthorized',
    'forbidden',
    'validation failed',
    'duplicate key',
    'cast error',
    'not found',
    'invalid',
    'malformed'
  ];
  
  const message = error.message.toLowerCase();
  return nonRetryablePatterns.some(pattern => message.includes(pattern));
};

/**
 * Standard error response formatter
 * @param {Error} error - The error to format
 * @param {string} operation - The operation that failed
 * @returns {Object} - Formatted error response
 */
export const formatApiError = (error, operation = 'Operation') => {
  console.error(`API Error in ${operation}:`, error);
  
  // Return user-friendly error messages
  if (error.message.includes('MongoDB')) {
    return {
      success: false,
      message: 'Database connection issue. Please try again in a moment.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
  
  if (error.message.includes('timeout')) {
    return {
      success: false,
      message: 'Request timed out. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
  
  return {
    success: false,
    message: error.message || 'An unexpected error occurred.',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  };
};

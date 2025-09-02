// Client-side hook for API calls with retry logic and better loading states
"use client";

import { useState, useCallback } from 'react';

/**
 * Custom hook for API calls with retry logic, loading states, and error handling
 * @param {Object} options - Configuration options
 * @returns {Object} - API functions and state
 */
export const useApiWithRetry = (options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    showLoadingMinTime = 800, // Minimum time to show loading (prevents flashing)
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  /**
   * Execute an API call with retry logic
   * @param {Function} apiCall - Function that returns a fetch promise
   * @param {Object} callOptions - Options for this specific call
   * @returns {Promise} - Result of the API call
   */
  const executeWithRetry = useCallback(async (apiCall, callOptions = {}) => {
    const {
      retries = maxRetries,
      onRetry = null,
      skipLoading = false,
      operationName = 'API call'
    } = callOptions;

    if (!skipLoading) {
      setLoading(true);
      setError(null);
      setRetryCount(0);
    }

    const startTime = Date.now();
    let lastError = null;

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        console.log(`${operationName} - Attempt ${attempt}/${retries + 1}`);
        
        const result = await apiCall();
        
        // Ensure minimum loading time to prevent flashing
        const elapsed = Date.now() - startTime;
        if (!skipLoading && elapsed < showLoadingMinTime) {
          await new Promise(resolve => setTimeout(resolve, showLoadingMinTime - elapsed));
        }
        
        if (!skipLoading) {
          setLoading(false);
          setError(null);
          setRetryCount(0);
        }
        
        if (attempt > 1) {
          console.log(`✅ ${operationName} succeeded on retry attempt ${attempt}`);
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        console.error(`❌ ${operationName} failed on attempt ${attempt}:`, error.message);
        
        // Don't retry certain types of errors
        if (isNonRetryableError(error) || attempt === retries + 1) {
          if (!skipLoading) {
            setLoading(false);
            setError(error.message || 'An unexpected error occurred');
            setRetryCount(attempt - 1);
          }
          
          if (attempt === retries + 1) {
            console.error(`💥 ${operationName} failed after ${retries + 1} attempts`);
          }
          
          throw error;
        }
        
        // Update retry count
        if (!skipLoading) {
          setRetryCount(attempt);
        }
        
        // Call retry callback if provided
        if (onRetry) {
          onRetry(attempt, error);
        }
        
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 500;
        console.log(`⏳ Waiting ${delay.toFixed(0)}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }, [maxRetries, baseDelay, showLoadingMinTime]);

  /**
   * Simple wrapper for GET requests
   */
  const get = useCallback(async (url, callOptions = {}) => {
    return executeWithRetry(async () => {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    }, { ...callOptions, operationName: `GET ${url}` });
  }, [executeWithRetry]);

  /**
   * Simple wrapper for POST requests
   */
  const post = useCallback(async (url, data, callOptions = {}) => {
    return executeWithRetry(async () => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    }, { ...callOptions, operationName: `POST ${url}` });
  }, [executeWithRetry]);

  /**
   * Reset error state
   */
  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  /**
   * Manual retry function
   */
  const retry = useCallback(async (lastApiCall) => {
    if (lastApiCall) {
      clearError();
      return lastApiCall();
    }
  }, [clearError]);

  return {
    loading,
    error,
    retryCount,
    executeWithRetry,
    get,
    post,
    clearError,
    retry,
    // Utility states
    isRetrying: retryCount > 0,
    hasError: !!error,
  };
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
    'not found',
    'invalid',
    'malformed',
    '401',
    '403',
    '404',
    '422'
  ];
  
  const message = error.message.toLowerCase();
  return nonRetryablePatterns.some(pattern => message.includes(pattern));
};

/**
 * Specialized hook for data fetching with automatic retry
 * @param {string} url - The URL to fetch
 * @param {Object} options - Hook options
 * @returns {Object} - Data, loading state, error, and refetch function
 */
export const useFetchWithRetry = (url, options = {}) => {
  const [data, setData] = useState(null);
  const api = useApiWithRetry(options);
  
  const {
    autoFetch = true,
    onSuccess = null,
    onError = null,
  } = options;

  const fetchData = useCallback(async () => {
    if (!url) return;
    
    try {
      const result = await api.get(url, {
        operationName: `Fetch ${url}`
      });
      
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [url, api, onSuccess, onError]);

  // Auto-fetch on mount if enabled
  const { useEffect } = require('react');
  useEffect(() => {
    if (autoFetch && url) {
      fetchData();
    }
  }, [autoFetch, url, fetchData]);

  return {
    data,
    loading: api.loading,
    error: api.error,
    retryCount: api.retryCount,
    isRetrying: api.isRetrying,
    refetch: fetchData,
    clearError: api.clearError,
  };
};

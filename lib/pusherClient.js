// Singleton Pusher client for frontend with connection monitoring
import Pusher from 'pusher-js';

let pusherInstance = null;
let connectionMonitorInterval = null;

export const getPusherClient = () => {
  if (!pusherInstance) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    
    if (!key || !cluster) {
      console.error('[Pusher] Missing environment variables:', { key: !!key, cluster: !!cluster });
      return null;
    }
    
    pusherInstance = new Pusher(key, {
      cluster: cluster,
      forceTLS: true,
      enabledTransports: ['ws', 'wss'],
      activityTimeout: 30000, // 30 seconds
      pongTimeout: 10000, // 10 seconds
    });
    
    // Enable Pusher logging in development
    if (process.env.NODE_ENV === 'development') {
      Pusher.logToConsole = true;
    }
    
    // Connection state monitoring
    pusherInstance.connection.bind('connected', () => {
      console.log('[Pusher] ✅ Connected successfully');
    });
    
    pusherInstance.connection.bind('disconnected', () => {
      console.warn('[Pusher] ⚠️ Disconnected');
    });
    
    pusherInstance.connection.bind('unavailable', () => {
      console.error('[Pusher] ❌ Connection unavailable');
    });
    
    pusherInstance.connection.bind('failed', () => {
      console.error('[Pusher] ❌ Connection failed');
    });
    
    pusherInstance.connection.bind('error', (err) => {
      console.error('[Pusher] ❌ Connection error:', err);
    });
    
    // Monitor connection state every 30 seconds
    connectionMonitorInterval = setInterval(() => {
      const state = pusherInstance.connection.state;
      if (state !== 'connected') {
        console.warn(`[Pusher] Connection state: ${state} - Attempting to reconnect...`);
        pusherInstance.connect();
      }
    }, 30000);
    
    console.log('[Pusher] Client instance created with cluster:', cluster);
  }
  
  return pusherInstance;
};

// Clean up function (call this on app unmount if needed)
export const disconnectPusher = () => {
  if (pusherInstance) {
    if (connectionMonitorInterval) {
      clearInterval(connectionMonitorInterval);
      connectionMonitorInterval = null;
    }
    pusherInstance.disconnect();
    pusherInstance = null;
    console.log('[Pusher] Disconnected and cleaned up');
  }
};

export default getPusherClient;


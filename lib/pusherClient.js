// Singleton Pusher client for frontend
import Pusher from 'pusher-js';

let pusherInstance = null;

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
    });
    
    // Enable Pusher logging in development
    if (process.env.NODE_ENV === 'development') {
      Pusher.logToConsole = true;
    }
    
    console.log('[Pusher] Client instance created with cluster:', cluster);
  }
  
  return pusherInstance;
};

export default getPusherClient;


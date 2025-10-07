// Singleton Pusher client for frontend
import Pusher from 'pusher-js';

let pusherInstance = null;

export const getPusherClient = () => {
  if (!pusherInstance) {
    pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
    
    console.log('[Pusher] Client instance created');
  }
  
  return pusherInstance;
};

export default getPusherClient;


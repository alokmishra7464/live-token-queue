import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Calls `onUpdate` on first connect, on reconnect, and whenever the
// server says "queue:update". The page just re-fetches its data.
export default function useQueueUpdates(onUpdate) {
  const callback = useRef(onUpdate);
  callback.current = onUpdate;

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || undefined);
    socket.on('connect', () => callback.current());
    socket.on('queue:update', () => callback.current());
    return () => socket.disconnect();
  }, []);
}

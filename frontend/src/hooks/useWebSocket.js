import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export function useWebSocket(url, options = {}) {
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectAttempts = 3,
    reconnectInterval = 3000,
    autoConnect = true
  } = options;

  const wsRef = useRef(null);
  const reconnectCountRef = useRef(0);
  const shouldReconnectRef = useRef(true);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const wsUrl = token ? `${url}?token=${token}` : url;
      const ws = new WebSocket(wsUrl);
      
      wsRef.current = ws;

      ws.onopen = (event) => {
        console.log('WebSocket connected');
        reconnectCountRef.current = 0;
        if (onOpen) onOpen(event);
        toast.success('Real-time updates connected', { icon: '🔗' });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) onMessage(data);
          
          // Auto-toast for important events
          if (data.type === 'request_updated') {
            toast(`Request ${data.requestId} updated`, {
              icon: '🔄',
              duration: 3000
            });
          } else if (data.type === 'new_request') {
            toast(`New request submitted`, {
              icon: '📝',
              duration: 3000
            });
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        if (onClose) onClose(event);
        
        if (shouldReconnectRef.current && reconnectCountRef.current < reconnectAttempts) {
          setTimeout(() => {
            reconnectCountRef.current++;
            console.log(`Reconnecting attempt ${reconnectCountRef.current}...`);
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
        toast.error('Connection error', { icon: '❌' });
      };

    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    toast('Disconnected from real-time updates', { icon: '🔌' });
  }, []);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    console.warn('WebSocket not connected');
    return false;
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, autoConnect]);

  return {
    connect,
    disconnect,
    send,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    readyState: wsRef.current?.readyState,
    reconnectCount: reconnectCountRef.current
  };
}
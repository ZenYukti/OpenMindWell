import { useEffect, useRef, useState, useCallback } from 'react';

interface ChatMessage {
  type: 'join' | 'leave' | 'chat' | 'crisis_alert' | 'history' | 'error' | 'typing' | 'online_count';
  roomId?: string;
  userId?: string;
  nickname?: string;
  content?: string;
  riskLevel?: string;
  timestamp?: string;
  messages?: any[];
  count?: number;
}

interface UseWebSocketOptions {
  roomId: string;
  userId: string;
  nickname: string;
  onMessage?: (message: ChatMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket({
  roomId,
  userId,
  nickname,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // FIX: Store all callbacks in refs to prevent unnecessary reconnections
  // if the parent component passes inline functions.
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onErrorRef.current = onError;
  }, [onMessage, onConnect, onDisconnect, onError]);

  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    // If we are already connected or connecting, skip
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;

        // Send join message
        ws.send(JSON.stringify({ 
          type: 'join', 
          roomId, 
          userId, 
          nickname 
        }));
        
        onConnectRef.current?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: ChatMessage = JSON.parse(event.data);
          onMessageRef.current?.(message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection error occurred');
        onErrorRef.current?.(error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onDisconnectRef.current?.();

        // Reconnect logic
        if (wsRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(3000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setConnectionError('Failed to create connection');
    }
  }, [roomId, userId, nickname]); // Removed callback refs from dependencies to prevent loops

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        try {
          // Send explicit leave
          wsRef.current.send(JSON.stringify({ 
            type: 'leave', 
            roomId, 
            userId, 
            nickname 
          }));
        } catch (e) { /* ignore */ }
      }
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, [roomId, userId, nickname]);

  const sendMessage = useCallback((contentOrJson: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Check if the input is already a JSON string (for typing/leave events)
      if (contentOrJson.startsWith('{')) {
        wsRef.current.send(contentOrJson);
      } else {
        // Otherwise wrap it as a standard chat message
        wsRef.current.send(JSON.stringify({
          type: 'chat',
          roomId,
          userId,
          nickname,
          content: contentOrJson,
          timestamp: new Date().toISOString(),
        }));
      }
      return true;
    }
    return false;
  }, [roomId, userId, nickname]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { isConnected, connectionError, sendMessage };
}
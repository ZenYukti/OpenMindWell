import { useEffect, useRef, useState, useCallback } from 'react';

interface ChatMessage {
  type: 'join' | 'leave' | 'chat' | 'crisis_alert' | 'history' | 'error' | 'typing';
  roomId?: string;
  userId?: string;
  nickname?: string;
  content?: string;
  riskLevel?: string;
  timestamp?: string;
  messages?: any[];
  message?: string;
  isTyping?: boolean;
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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 2;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
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
        ws.send(
          JSON.stringify({
            type: 'join',
            roomId,
            userId,
            nickname,
          })
        );

        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: ChatMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection error occurred');
        onError?.(error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onDisconnect?.();

        // Attempt to reconnect with longer delays
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(3000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setConnectionError('Connection lost. Please refresh to reconnect.');
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setConnectionError('Failed to create connection');
    }
  }, [roomId, userId, nickname, onMessage, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      // Send leave message before closing
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'leave',
            roomId,
            userId,
          })
        );
      }

      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, [roomId, userId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'chat',
            roomId,
            userId,
            nickname,
            content,
            timestamp: new Date().toISOString(),
          })
        );
        return true;
      }
      return false;
    },
    [roomId, userId, nickname]
  );

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userId, nickname]);

  return {
    isConnected,
    connectionError,
    sendMessage,
    sendTyping: (isTyping: boolean) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'typing',
            roomId,
            userId,
            nickname,
            content: isTyping ? 'true' : 'false',
          })
        );
      }
    },
    reconnect: connect,
    disconnect,
  };
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface Message {
  id?: string;
  userId: string;
  nickname: string;
  content: string;
  timestamp: string;
  riskLevel?: string;
  type?: string;
}

interface ChatRoomProps {
  room: {
    id: string;
    name: string;
    description: string;
  };
  currentUser: {
    id: string;
    nickname: string;
  };
  onClose: () => void;
}

export default function ChatRoom({ room, currentUser, onClose }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleMessage = useCallback((message: any) => {
    if (message.type === 'history') {
      // Load message history
      setMessages(message.messages || []);
    } else if (message.type === 'chat') {
      // Add new chat message
      setMessages((prev) => [
        ...prev,
        {
          userId: message.userId!,
          nickname: message.nickname!,
          content: message.content!,
          timestamp: message.timestamp!,
          riskLevel: message.riskLevel,
        },
      ]);

      // Show crisis alert if detected
      if (message.riskLevel === 'high' || message.riskLevel === 'critical') {
        setShowCrisisAlert(true);
        setTimeout(() => setShowCrisisAlert(false), 10000);
      }
    } else if (message.type === 'join') {
      // User joined notification
      setMessages((prev) => [
        ...prev,
        {
          userId: 'system',
          nickname: 'System',
          content: `${message.nickname} joined the room`,
          timestamp: message.timestamp!,
          type: 'system',
        },
      ]);
    } else if (message.type === 'leave') {
      // User left notification
      setMessages((prev) => [
        ...prev,
        {
          userId: 'system',
          nickname: 'System',
          content: `${message.nickname} left the room`,
          timestamp: message.timestamp!,
          type: 'system',
        },
      ]);
      setTimeout(() => setShowCrisisAlert(false), 10000);
    } else if (message.type === 'typing') {
      const { nickname, isTyping } = message;
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(nickname);
        } else {
          newSet.delete(nickname);
        }
        return newSet;
      });
    }
  }, []);

  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { isConnected, connectionError, sendMessage, sendTyping } = useWebSocket({
    roomId: room.id,
    userId: currentUser.id,
    nickname: currentUser.nickname,
    onMessage: handleMessage,
    onConnect: () => {
      console.log('Connected to chat room:', room.name);
    },
    onDisconnect: () => {
      console.log('Disconnected from chat room');
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // Debounce typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    } else {
      sendTyping(true);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
      typingTimeoutRef.current = undefined;
    }, 2000);
  };


  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !isConnected) {
      return;
    }

    const success = sendMessage(inputValue.trim());
    if (success) {
      setInputValue('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{room.name}</h2>
            <p className="text-sm text-gray-600">{room.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-600">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Crisis Alert Banner */}
        {showCrisisAlert && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-red-800">
                  ⚠️ CRISIS DETECTED - Moderators have been notified
                </p>
                <p className="text-xs text-red-700 mt-1">
                  🇺🇸 Call 988 | Text HOME to 741741 | 🇮🇳 Call 9152987821 (iCall) | KIRAN 1800-599-0019
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Connection Error */}
        {connectionError && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3">
            <p className="text-sm text-yellow-800">⚠️ {connectionError}</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${
                msg.type === 'system'
                  ? 'text-center'
                  : msg.userId === currentUser.id
                  ? 'flex justify-end'
                  : 'flex justify-start'
              }`}
            >
              {msg.type === 'system' ? (
                <div className="text-xs text-gray-500 italic">{msg.content}</div>
              ) : (
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.userId === currentUser.id
                      ? 'bg-primary-600 text-white'
                      : msg.riskLevel === 'high' || msg.riskLevel === 'critical'
                      ? 'bg-red-100 border border-red-300'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-semibold ${
                        msg.userId === currentUser.id
                          ? 'text-primary-100'
                          : msg.riskLevel === 'high' || msg.riskLevel === 'critical'
                          ? 'text-red-700'
                          : 'text-gray-600'
                      }`}
                    >
                      {msg.userId === currentUser.id ? 'You' : msg.nickname}
                    </span>
                    <span
                      className={`text-xs ${
                        msg.userId === currentUser.id
                          ? 'text-primary-200'
                          : msg.riskLevel === 'high' || msg.riskLevel === 'critical'
                          ? 'text-red-500'
                          : 'text-gray-400'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      msg.userId === currentUser.id
                        ? 'text-white'
                        : msg.riskLevel === 'high' || msg.riskLevel === 'critical'
                        ? 'text-red-900'
                        : 'text-gray-800'
                    }`}
                  >
                    {msg.content}
                  </p>
                  {(msg.riskLevel === 'high' || msg.riskLevel === 'critical') && (
                    <div className="mt-1 text-xs text-red-600 font-medium">⚠️ Crisis language detected</div>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="px-4 py-2 text-xs text-gray-500 italic bg-gray-50 border-t border-gray-100">
            {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={isConnected ? 'Type your message...' : 'Connecting...'}
              disabled={!isConnected}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!isConnected || !inputValue.trim()}
              className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Be kind and supportive. All messages are monitored for safety.
          </p>
        </form>
      </div>
    </div>
  );
}

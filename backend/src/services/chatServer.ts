import WebSocket from 'ws';
import { supabase } from '../lib/supabase';
import { detectCrisis, getCrisisResourcesMessage } from './crisisDetection';

export interface AuthenticatedWebSocket extends WebSocket {
  isAlive?: boolean;
  roomId?: string;
  userId?: string;
  nickname?: string;
}

interface ChatMessage {
  type: 'join' | 'leave' | 'chat' | 'crisis_alert' | 'typing';
  roomId?: string;
  userId?: string;
  nickname?: string;
  content?: string;
  riskLevel?: string;
  timestamp?: string;
  isTyping?: boolean;
}

interface RoomMember {
  ws: AuthenticatedWebSocket;
  userId: string;
  nickname: string;
}

export class ChatServer {
  private wss: WebSocket.Server;
  private rooms: Map<string, Set<RoomMember>>;

  constructor(server: any) {
    this.wss = new WebSocket.Server({ server });
    this.rooms = new Map();

    this.wss.on('connection', this.handleConnection.bind(this));

    // Heartbeat to detect dead connections
    setInterval(() => {
      this.wss.clients.forEach((client) => {
        const ws = client as AuthenticatedWebSocket;
        if (ws.isAlive === false) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  private handleConnection(client: WebSocket) {
    const ws = client as AuthenticatedWebSocket;
    console.log('New WebSocket connection');

    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data: string) => {
      try {
        const message: ChatMessage = JSON.parse(data.toString());
        await this.handleMessage(ws, message);
      } catch (error) {
        console.error('Error handling message:', error);
        // Send error but don't close connection
        try {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        } catch (sendError) {
          console.error('Error sending error message:', sendError);
        }
      }
    });

    ws.on('close', () => {
      this.handleDisconnect(ws);
    });
  }

  private async handleMessage(ws: AuthenticatedWebSocket, message: ChatMessage) {
    switch (message.type) {
      case 'join':
        await this.handleJoin(ws, message);
        break;
      case 'leave':
        this.handleLeave(ws, message);
        break;
      case 'chat':
        await this.handleChatMessage(ws, message);
        break;
      case 'typing':
        this.handleTyping(ws, message);
        break;
      default:
        ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    }
  }

  private handleTyping(ws: AuthenticatedWebSocket, message: ChatMessage) {
    const { roomId, userId, nickname } = ws;

    if (roomId && userId) {
      const isTyping = typeof message.isTyping === 'boolean' ? message.isTyping : false;
      // Broadcast to other users in the room
      this.broadcastToRoom(roomId, {
        type: 'typing',
        userId,
        nickname,
        isTyping,
      }, userId); // Exclude sender
    }
  }

  private async handleJoin(ws: AuthenticatedWebSocket, message: ChatMessage) {
    const { roomId, userId, nickname } = message;

    if (!roomId || !userId || !nickname) {
      ws.send(JSON.stringify({ type: 'error', message: 'Missing required fields' }));
      return;
    }

    try {
      // Add user to room
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, new Set());
      }

      const room = this.rooms.get(roomId)!;
      room.add({ ws, userId, nickname });

      // Store connection metadata
      ws.roomId = roomId;
      ws.userId = userId;
      ws.nickname = nickname;

      // Fetch recent messages from database (without profile join - nicknames come from messages)
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching messages:', error);
        // Send error but continue - don't crash the connection
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Could not load message history' 
        }));
      } else {
        ws.send(
          JSON.stringify({
            type: 'history',
            messages: messages?.reverse() || [],
          })
        );
      }

      // Broadcast join event
      this.broadcastToRoom(roomId, {
        type: 'join',
        userId,
        nickname,
        timestamp: new Date().toISOString(),
      });

      console.log(`${nickname} joined room ${roomId}`);
    } catch (error) {
      console.error('Error in handleJoin:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to join room' 
      }));
    }
  }

  private handleLeave(ws: AuthenticatedWebSocket, message: ChatMessage) {
    const { roomId, userId, nickname } = ws;

    if (roomId && userId) {
      const room = this.rooms.get(roomId);
      if (room) {
        // Remove user from room
        room.forEach((member) => {
          if (member.userId === userId) {
            room.delete(member);
          }
        });

        // Broadcast leave event
        this.broadcastToRoom(roomId, {
          type: 'leave',
          userId,
          nickname,
          timestamp: new Date().toISOString(),
        });
        
        // Clear typing indicator for leaving user
        this.broadcastToRoom(roomId, {
          type: 'typing',
          userId,
          nickname,
          isTyping: false,
        });

        console.log(`${nickname} left room ${roomId}`);
      }
    }
  }

  private async handleChatMessage(ws: AuthenticatedWebSocket, message: ChatMessage) {
    const { content } = message;
    const { roomId, userId, nickname } = ws;

    if (!content || !roomId || !userId) {
      ws.send(JSON.stringify({ type: 'error', message: 'Missing required fields' }));
      return;
    }

    // Detect crisis in message
    const crisisResult = await detectCrisis(content);

    // Save message to database with risk level
    const { data: savedMessage, error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        user_id: userId,
        content,
        risk_level: crisisResult.riskLevel,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error saving message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to save message' }));
      return;
    }

    // Broadcast message to room with nickname from WebSocket metadata
    this.broadcastToRoom(roomId, {
      type: 'chat',
      userId: savedMessage.user_id,
      nickname: nickname, // Use nickname from WebSocket connection
      content: savedMessage.content,
      timestamp: savedMessage.created_at,
      riskLevel: savedMessage.risk_level,
    });

    // Send crisis alert if detected
    if (crisisResult.isCrisis && crisisResult.riskLevel !== 'none') {
      const resourcesMessage = getCrisisResourcesMessage(crisisResult.riskLevel);

      // Send private crisis resources to the user
      ws.send(
        JSON.stringify({
          type: 'crisis_alert',
          riskLevel: crisisResult.riskLevel,
          message: resourcesMessage,
          timestamp: new Date().toISOString(),
        })
      );

      console.log(
        `Crisis detected (${crisisResult.riskLevel}) in room ${roomId} by ${nickname}`
      );
    }
  }

  private handleDisconnect(ws: AuthenticatedWebSocket) {
    const { roomId, userId } = ws;

    if (roomId && userId) {
      const room = this.rooms.get(roomId);
      if (room) {
        room.forEach((member) => {
          if (member.userId === userId) {
            room.delete(member);
          }
        });
        
        // Clear typing indicator for disconnected user
        this.broadcastToRoom(roomId, {
          type: 'typing',
          userId,
          nickname: ws.nickname,
          isTyping: false,
        });
      }
    }

    console.log('WebSocket disconnected');
  }

  private broadcastToRoom(roomId: string, message: any, excludeUserId?: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    room.forEach((member) => {
      if (member.userId !== excludeUserId && member.ws.readyState === WebSocket.OPEN) {
        member.ws.send(messageStr);
      }
    });
  }
}

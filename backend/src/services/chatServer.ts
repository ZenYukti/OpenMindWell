import WebSocket from 'ws';
import { supabase } from '../lib/supabase';
import { updateRoomCount } from '../lib/roomState'; // <--- IMPORT THIS

interface ChatMessage {
  type: 'join' | 'leave' | 'chat' | 'crisis_alert' | 'typing' | 'online_count';
  roomId?: string;
  userId?: string;
  nickname?: string;
  content?: string;
  riskLevel?: string;
  timestamp?: string;
  count?: number;
}

interface RoomMember {
  ws: WebSocket;
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

    // Heartbeat to clean up dead connections
    setInterval(() => {
      this.wss.clients.forEach((ws: any) => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  // FIX: Lazy Cleanup - Removes dead sockets while counting
  private getUniqueUserCount(roomId: string): number {
    const room = this.rooms.get(roomId);
    if (!room) return 0;
    
    const uniqueUsers = new Set<string>();
    
    // Check every member. If their socket is closed, remove them NOW.
    for (const member of room) {
        if (member.ws.readyState !== WebSocket.OPEN && member.ws.readyState !== WebSocket.CONNECTING) {
            room.delete(member); // Auto-cleanup dead user
        } else {
            uniqueUsers.add(member.userId);
        }
    }
    
    return uniqueUsers.size;
  }

  // Helper to sync state with the API
  private updateSharedState(roomId: string) {
    const count = this.getUniqueUserCount(roomId);
    updateRoomCount(roomId, count);
  }

  private handleConnection(ws: WebSocket) {
    (ws as any).isAlive = true;
    ws.on('pong', () => { (ws as any).isAlive = true; });

    ws.on('message', async (data: string) => {
      try {
        const message: ChatMessage = JSON.parse(data.toString());
        await this.handleMessage(ws, message);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    ws.on('close', () => {
      this.handleDisconnect(ws);
    });
  }

  private async handleMessage(ws: WebSocket, message: ChatMessage) {
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
    }
  }

  private async handleJoin(ws: WebSocket, message: ChatMessage) {
    const { roomId, userId, nickname } = message;
    if (!roomId || !userId || !nickname) return;

    try {
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, new Set());
      }
      const room = this.rooms.get(roomId)!;

      // Clean up ANY existing connections for this user ID
      for (const member of room) {
        if (member.userId === userId) {
          room.delete(member);
          // Force close old socket so it doesn't linger
          if (member.ws.readyState === WebSocket.OPEN) {
             member.ws.terminate();
          }
        }
      }

      room.add({ ws, userId, nickname });
      
      // Attach metadata to socket for easier cleanup on disconnect
      (ws as any).roomId = roomId;
      (ws as any).userId = userId;
      (ws as any).nickname = nickname;

      // Update Shared State for API
      this.updateSharedState(roomId);

      // 1. Load History
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(50);

      ws.send(JSON.stringify({
        type: 'history',
        messages: messages?.reverse() || [],
      }));

      // 2. Broadcast Online Count
      this.broadcastToRoom(roomId, {
        type: 'online_count',
        count: this.getUniqueUserCount(roomId)
      });

      // 3. Notify room
      this.broadcastToRoom(roomId, {
        type: 'join',
        userId,
        nickname,
        timestamp: new Date().toISOString(),
      });

      console.log(`${nickname} joined room ${roomId}`);

    } catch (error) {
      console.error('Error in handleJoin:', error);
    }
  }

  private handleLeave(ws: WebSocket, message: ChatMessage) {
    this.handleDisconnect(ws);
  }

  private handleTyping(ws: WebSocket, message: ChatMessage) {
    const roomId = (ws as any).roomId;
    const userId = (ws as any).userId;
    const nickname = message.nickname || (ws as any).nickname;

    if (roomId && userId) {
        this.broadcastToRoom(roomId, {
            type: 'typing',
            userId,
            nickname
        });
    }
  }

  private async handleChatMessage(ws: WebSocket, message: ChatMessage) {
    const { content } = message;
    const roomId = (ws as any).roomId;
    const userId = (ws as any).userId;
    const nickname = (ws as any).nickname;

    if (!content || !roomId || !userId) return;

    const riskLevel = 'none'; 

    const { data: savedMessage, error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        user_id: userId,
        content,
        risk_level: riskLevel,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return;
    }

    this.broadcastToRoom(roomId, {
      type: 'chat',
      userId: savedMessage.user_id,
      nickname: nickname,
      content: savedMessage.content,
      timestamp: savedMessage.created_at,
      riskLevel: savedMessage.risk_level,
    });
  }

  private handleDisconnect(ws: WebSocket) {
    const roomId = (ws as any).roomId;
    
    // FIX: Robust disconnect handling using Socket Reference
    if (roomId) {
      const room = this.rooms.get(roomId);
      if (room) {
        let nickname = '';
        
        // Remove THIS specific socket (more accurate than userId)
        for (const member of room) {
          if (member.ws === ws) {
            nickname = member.nickname;
            room.delete(member);
            break;
          }
        }
        
        // Update Shared State immediately
        this.updateSharedState(roomId);
        
        // Broadcast new count to everyone else
        this.broadcastToRoom(roomId, {
            type: 'online_count',
            count: this.getUniqueUserCount(roomId)
        });

        if (nickname) {
            this.broadcastToRoom(roomId, {
                type: 'leave',
                userId: (ws as any).userId,
                nickname,
                timestamp: new Date().toISOString(),
            });
        }
      }
    }
  }

  private broadcastToRoom(roomId: string, message: any) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    room.forEach((member) => {
      if (member.ws.readyState === WebSocket.OPEN) {
        member.ws.send(messageStr);
      }
    });
  }
}
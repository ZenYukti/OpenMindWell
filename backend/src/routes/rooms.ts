import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getRoomCount } from '../lib/roomState'; // <--- MUST IMPORT THIS

const router = Router();

// Get all rooms
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching rooms:', error);
      return res.status(500).json({ error: 'Failed to fetch rooms' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activity count for a room (For the Card display)
router.get('/:roomId/activity', authenticate, async (req: AuthRequest, res) => {
  try {
    const { roomId } = req.params;
    
    // FIX: Read from shared memory logic instead of Database
    // This provides INSTANT updates when users join/leave
    const liveCount = getRoomCount(roomId);
    
    res.json({ count: liveCount });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages for a room
router.get('/:roomId/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    // Fetch messages without joining profiles (will get user data from WebSocket)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    res.json((data || []).reverse());
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
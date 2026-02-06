import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Helper function to calculate streak for a habit
async function calculateStreak(habitId: string, userId: string): Promise<number> {
  const { data: logs, error } = await supabase
    .from('habit_logs')
    .select('completed_at')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error || !logs || logs.length === 0) {
    return 0;
  }

  // Get unique dates (in user's local date format)
  const uniqueDates = [...new Set(
    logs.map(log => new Date(log.completed_at).toISOString().split('T')[0])
  )].sort().reverse();

  if (uniqueDates.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Streak must include today or yesterday
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i - 1]);
    const prevDate = new Date(uniqueDates[i]);
    const diffDays = (currentDate.getTime() - prevDate.getTime()) / 86400000;

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Get all habits for authenticated user with streaks
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const { data: habits, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching habits:', error);
      return res.status(500).json({ error: 'Failed to fetch habits' });
    }

    // Calculate streaks for each habit
    const habitsWithStreaks = await Promise.all(
      (habits || []).map(async (habit) => {
        const streak = await calculateStreak(habit.id, userId);
        return { ...habit, current_streak: streak };
      })
    );

    res.json(habitsWithStreaks);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get today's logs for all habits (for checked-in status)
router.get('/today', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('habit_logs')
      .select('habit_id, completed_at, notes')
      .eq('user_id', userId)
      .gte('completed_at', `${today}T00:00:00.000Z`)
      .lt('completed_at', `${today}T23:59:59.999Z`);

    if (error) {
      console.error('Error fetching today logs:', error);
      return res.status(500).json({ error: 'Failed to fetch today logs' });
    }

    // Return as a map of habit_id -> log
    const todayLogs: Record<string, any> = {};
    (data || []).forEach(log => {
      todayLogs[log.habit_id] = log;
    });

    res.json(todayLogs);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new habit
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { name, description, frequency } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name,
        description: description || '',
        frequency: frequency || 'daily',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating habit:', error);
      return res.status(500).json({ error: 'Failed to create habit' });
    }

    // Return with streak = 0 for new habit
    res.status(201).json({ ...data, current_streak: 0 });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Log habit completion
router.post('/:id/log', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { notes } = req.body;

    // Check if already logged today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingLog } = await supabase
      .from('habit_logs')
      .select('id')
      .eq('habit_id', id)
      .eq('user_id', userId)
      .gte('completed_at', `${today}T00:00:00.000Z`)
      .lt('completed_at', `${today}T23:59:59.999Z`)
      .single();

    if (existingLog) {
      return res.status(400).json({ error: 'Already logged today' });
    }

    const { data, error } = await supabase
      .from('habit_logs')
      .insert({
        habit_id: id,
        user_id: userId,
        notes: notes || '',
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging habit:', error);
      return res.status(500).json({ error: 'Failed to log habit' });
    }

    // Calculate and return new streak
    const newStreak = await calculateStreak(id, userId);
    res.status(201).json({ ...data, new_streak: newStreak });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get habit logs
router.get('/:id/logs', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', id)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching habit logs:', error);
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update habit
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, description, frequency } = req.body;

    const { data, error } = await supabase
      .from('habits')
      .update({
        name,
        description,
        frequency,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating habit:', error);
      return res.status(500).json({ error: 'Failed to update habit' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Return with current streak
    const streak = await calculateStreak(id, userId);
    res.json({ ...data, current_streak: streak });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete habit
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting habit:', error);
      return res.status(500).json({ error: 'Failed to delete habit' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all habits for authenticated user
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

    if (!habits) return res.json([]);

    // Fetch all logs for the user to calculate streaks efficiently
    const { data: allLogs, error: logsError } = await supabase
      .from('habit_logs')
      .select('habit_id, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (logsError) {
      console.error('Error fetching logs for streaks:', logsError);
      return res.json(habits.map(h => ({ ...h, current_streak: 0 })));
    }

    const logsByHabit: Record<string, string[]> = {};
    (allLogs || []).forEach(log => {
      if (!logsByHabit[log.habit_id]) logsByHabit[log.habit_id] = [];
      logsByHabit[log.habit_id].push(log.completed_at);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const habitsWithStreaks = habits.map(habit => {
      const logs = logsByHabit[habit.id] || [];
      const streak = calculateStreakFromLogs(logs);
      return { ...habit, current_streak: streak };
    });

    res.json(habitsWithStreaks);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get today's logs for all habits
router.get('/today', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('completed_at', today.toISOString());

    if (error) {
      console.error('Error fetching today\'s logs:', error);
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }

    const logsByHabit = (data || []).reduce((acc: any, log: any) => {
      acc[log.habit_id] = log;
      return acc;
    }, {});

    res.json(logsByHabit);
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

    res.status(201).json(data);
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

    // Calculate new streak
    const newStreak = await calculateHabitStreak(id, userId);

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

    res.json(data);
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

// Helper to calculate streak from a list of completion timestamps (ISO strings)
function calculateStreakFromLogs(logs: string[]): number {
  if (!logs || logs.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastLogDate = new Date(logs[0]);
  lastLogDate.setHours(0, 0, 0, 0);

  if (lastLogDate.getTime() < yesterday.getTime()) return 0;

  let streak = 0;
  let expectedDate = new Date(today);
  if (lastLogDate.getTime() === yesterday.getTime()) {
    expectedDate = new Date(yesterday);
  }

  let lastDayProcessed = -1;
  for (const logAt of logs) {
    const logDate = new Date(logAt);
    logDate.setHours(0, 0, 0, 0);

    if (logDate.getTime() === lastDayProcessed) continue;

    if (logDate.getTime() === expectedDate.getTime()) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
      lastDayProcessed = logDate.getTime();
    } else if (logDate.getTime() < expectedDate.getTime()) {
      break;
    }
  }
  return streak;
}

// Helper to calculate streak for a single habit from DB
async function calculateHabitStreak(habitId: string, userId: string): Promise<number> {
  const { data: logs, error } = await supabase
    .from('habit_logs')
    .select('completed_at')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error || !logs) return 0;
  return calculateStreakFromLogs(logs.map(l => l.completed_at));
}

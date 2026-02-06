import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all habits for authenticated user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching habits:', error);
      return res.status(500).json({ error: 'Failed to fetch habits' });
    }

    res.json(data || []);
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

    res.status(201).json(data);
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

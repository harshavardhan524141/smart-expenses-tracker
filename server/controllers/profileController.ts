import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { getAuthenticatedSupabaseClient, fallbackStore } from '../supabaseClient.ts';

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const supabase = getAuthenticatedSupabaseClient(req.token);

    if (supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // If profile doesn't exist yet, return user metadata
        return res.json({
          success: true,
          data: {
            id: userId,
            email: req.user!.email,
            full_name: req.user!.full_name || 'Account Holder',
            currency: req.user!.currency || 'INR',
          },
        });
      }

      return res.json({
        success: true,
        data: {
          ...data,
          email: req.user!.email,
        },
      });
    }

    // Fallback store
    let profile = fallbackStore.profiles.get(userId);
    if (!profile) {
      profile = {
        id: userId,
        email: req.user!.email,
        full_name: req.user!.full_name || 'Rahul Sharma',
        currency: 'INR',
      };
      fallbackStore.profiles.set(userId, profile);
    }

    return res.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('getProfile error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { full_name, currency } = req.body;

    if (!full_name && !currency) {
      return res.status(400).json({ success: false, error: 'No profile fields provided to update.' });
    }

    const supabase = getAuthenticatedSupabaseClient(req.token);

    if (supabase) {
      const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
      if (full_name !== undefined) updateData.full_name = full_name.trim();
      if (currency !== undefined) updateData.currency = currency.trim();

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...updateData,
        })
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, data });
    }

    // Fallback store
    const existing = fallbackStore.profiles.get(userId) || {
      id: userId,
      email: req.user!.email,
      full_name: 'Rahul Sharma',
      currency: 'INR',
    };

    if (full_name !== undefined) existing.full_name = full_name.trim();
    if (currency !== undefined) existing.currency = currency.trim();
    fallbackStore.profiles.set(userId, existing);

    return res.json({ success: true, data: existing });
  } catch (error: any) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

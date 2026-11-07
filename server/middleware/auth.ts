import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config.ts';

export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name?: string;
  currency?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  token?: string;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token missing. Please sign in.',
      });
    }

    const token = authHeader.split(' ')[1];
    req.token = token;

    // Check if token is a demo token or Supabase is not yet configured
    if (token.startsWith('demo-') || !config.isConfigured) {
      req.user = {
        id: token.startsWith('demo-') ? token : 'demo-user-123',
        email: 'student@example.com',
        full_name: 'Rahul Sharma',
        currency: 'INR',
      };
      return next();
    }

    // Verify token with real Supabase Auth
    const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired authentication session. Please sign in again.',
      });
    }

    req.user = {
      id: user.id,
      email: user.email || '',
      full_name: (user.user_metadata?.full_name as string) || '',
      currency: (user.user_metadata?.currency as string) || 'INR',
    };

    return next();
  } catch (err: any) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      success: false,
      error: 'Authentication verification service error.',
    });
  }
}

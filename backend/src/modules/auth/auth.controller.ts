import { Request, Response } from 'express';
import { pool } from '../../config/db';
import { hashPassword, verifyPassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  try {
    const hashed = await hashPassword(password);
    const [result]: any = await pool.query(
      'INSERT INTO users (email, password_hash, name, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [email, hashed, name]
    );
    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Database error' });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  
  try {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = rows[0];
    const match = await verifyPassword(password, user.password_hash);
    
    if (!match) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const payload = { id: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token to db
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, NOW())',
      [user.id, refreshToken, expiresAt] // simplified to save raw token instead of hash for now, or you can hash it
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const rawToken = req.headers.cookie
      ?.split('; ')
      .find(row => row.startsWith('refreshToken='))
      ?.split('=')[1] || req.body.refreshToken;

  if (!rawToken) {
    res.status(401).json({ error: 'No refresh token provided' });
    return;
  }

  try {
    const [rows]: any = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()',
      [rawToken]
    );

    if (rows.length === 0) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    // Verify token with jwt (optional double check)
    // generate new access token
    const tokenRecord = rows[0];
    const accessToken = generateAccessToken({ id: tokenRecord.user_id, email: '' }); // Fetch user email normally
    
    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const rawToken = req.headers.cookie
      ?.split('; ')
      .find(row => row.startsWith('refreshToken='))
      ?.split('=')[1] || req.body.refreshToken;

  if (rawToken) {
    await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?', [rawToken]);
  }

  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

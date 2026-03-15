import { Request, Response } from 'express';
import { pool } from '../../config/db';

export const getSubjectProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectId } = req.params;
    const userId = req.user?.id;

    // Get all videos for the subject
    const [videos]: any = await pool.query(`
      SELECT v.id 
      FROM videos v
      JOIN sections s ON v.section_id = s.id
      WHERE s.subject_id = ?
    `, [subjectId]);

    const total_videos = videos.length;

    // Get user progress for these videos
    const [progress]: any = await pool.query(`
      SELECT p.video_id, p.is_completed, p.last_position_seconds, p.updated_at
      FROM video_progress p
      JOIN videos v ON p.video_id = v.id
      JOIN sections s ON v.section_id = s.id
      WHERE p.user_id = ? AND s.subject_id = ?
      ORDER BY p.updated_at DESC
    `, [userId, subjectId]);

    const completed_videos = progress.filter((p: any) => p.is_completed === 1 || p.is_completed === true).length;
    const percent_complete = total_videos === 0 ? 0 : Math.round((completed_videos / total_videos) * 100);

    // Provide the last watched video info based on the most recently updated progress row
    let last_video_id = null;
    let last_position_seconds = 0;
    
    if (progress.length > 0) {
      last_video_id = progress[0].video_id;
      last_position_seconds = progress[0].last_position_seconds;
    }

    res.json({
      total_videos,
      completed_videos,
      percent_complete,
      last_video_id,
      last_position_seconds
    });
  } catch (error) {
    console.error('Progress subject fetch error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

export const getVideoProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params;
    const userId = req.user?.id;

    const [rows]: any = await pool.query(`
      SELECT last_position_seconds, is_completed 
      FROM video_progress 
      WHERE user_id = ? AND video_id = ?
    `, [userId, videoId]);

    if (rows.length === 0) {
      res.json({ last_position_seconds: 0, is_completed: false });
      return;
    }

    res.json({
      last_position_seconds: rows[0].last_position_seconds || 0,
      is_completed: !!rows[0].is_completed
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const updateVideoProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params;
    const userId = req.user?.id;
    const { last_position_seconds, is_completed } = req.body;

    const completedVal = is_completed ? 1 : 0;
    const position = last_position_seconds || 0;
    
    // Check if the row exists
    const [existing]: any = await pool.query('SELECT id FROM video_progress WHERE user_id = ? AND video_id = ?', [userId, videoId]);
    
    if (existing.length > 0) {
      await pool.query(`
        UPDATE video_progress 
        SET last_position_seconds = ?, is_completed = IF(is_completed = 1, 1, ?), 
            completed_at = IF(is_completed = 0 AND ? = 1, NOW(), completed_at),
            updated_at = NOW()
        WHERE user_id = ? AND video_id = ?
      `, [position, completedVal, completedVal, userId, videoId]);
    } else {
      await pool.query(`
        INSERT INTO video_progress 
        (user_id, video_id, last_position_seconds, is_completed, completed_at, created_at, updated_at) 
        VALUES (?, ?, ?, ?, IF(? = 1, NOW(), NULL), NOW(), NOW())
      `, [userId, videoId, position, completedVal, completedVal]);
    }

    res.json({ message: 'Progress updated successfully' });
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

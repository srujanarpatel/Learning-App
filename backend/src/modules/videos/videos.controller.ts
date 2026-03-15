import { Request, Response } from 'express';
import { pool } from '../../config/db';

export const getVideoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params;
    const userId = req.user?.id;

    // Get the core video information
    const [videoRows]: any = await pool.query(`
      SELECT 
        v.id, v.title, v.description, v.youtube_url, v.duration_seconds, v.section_id,
        s.title as section_title, s.subject_id, sub.title as subject_title
       FROM videos v
       JOIN sections s ON v.section_id = s.id
       JOIN subjects sub ON s.subject_id = sub.id
       WHERE v.id = ?
    `, [videoId]);

    if (videoRows.length === 0) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    const video = videoRows[0];

    // Fetch all videos for this subject ordered correctly to compute prev/next and locked
    const [allVideos]: any = await pool.query(`
      SELECT v.id, p.is_completed 
      FROM videos v
      JOIN sections sec ON v.section_id = sec.id
      LEFT JOIN video_progress p ON v.id = p.video_id AND p.user_id = ?
      WHERE sec.subject_id = ?
      ORDER BY sec.order_index ASC, v.order_index ASC
    `, [userId, video.subject_id]);

    let prevVideoId = null;
    let nextVideoId = null;
    let locked = true;
    let unlockReason = 'Previous lesson must be completed';

    let previousCompleted = true; // First video is always unlocked

    for (let i = 0; i < allVideos.length; i++) {
      const v = allVideos[i];

      // Current logic determines locked based on previousCompleted
      const isCurrentLocked = !previousCompleted;

      if (v.id === Number(videoId)) {
        locked = isCurrentLocked;
        if (!locked) unlockReason = '';

        if (i > 0) prevVideoId = allVideos[i - 1].id;
        if (i < allVideos.length - 1) nextVideoId = allVideos[i + 1].id;
        break;
      }

      previousCompleted = !!v.is_completed;
    }

    res.json({
      ...video,
      previous_video_id: prevVideoId,
      next_video_id: nextVideoId,
      locked,
      unlock_reason: unlockReason
    });
  } catch (error) {
    console.error('Video fetch error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

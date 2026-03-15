import { Request, Response } from 'express';
import { pool } from '../../config/db';

export const getSubjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM subjects WHERE is_published = 1');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const getSubjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectId } = req.params;
    const [rows]: any = await pool.query('SELECT * FROM subjects WHERE id = ? AND is_published = 1', [subjectId]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

// Tree helper logic
export const getSubjectTree = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectId } = req.params;
    const userId = req.user?.id; // Assuming auth middleware is up

    // Join progress too if we want is_completed info
    const [subjectRows]: any = await pool.query('SELECT * FROM subjects WHERE id = ? AND is_published = 1', [subjectId]);
    
    if (subjectRows.length === 0) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    const [sections]: any = await pool.query('SELECT * FROM sections WHERE subject_id = ? ORDER BY order_index ASC', [subjectId]);
    const [videos]: any = await pool.query(
      `SELECT v.*, p.is_completed, p.last_position_seconds 
       FROM videos v 
       LEFT JOIN video_progress p ON v.id = p.video_id AND p.user_id = ?
       JOIN sections s ON v.section_id = s.id
       WHERE s.subject_id = ? 
       ORDER BY s.order_index ASC, v.order_index ASC`,
      [userId, subjectId]
    );

    // Calculate locked status: first video unlocked, next unlocked if previous is completed
    let previousCompleted = true; // First video is unlocked initially

    const tree = {
      id: subjectRows[0].id,
      title: subjectRows[0].title,
      sections: sections.map((sec: any) => {
        const secVideos = videos.filter((v: any) => v.section_id === sec.id);
        const mappedVideos = secVideos.map((v: any, index: number) => {
          const locked = !previousCompleted;
          previousCompleted = !!v.is_completed;
          
          return {
            id: v.id,
            title: v.title,
            order_index: v.order_index,
            is_completed: !!v.is_completed,
            locked
          };
        });

        return {
          id: sec.id,
          title: sec.title,
          order_index: sec.order_index,
          videos: mappedVideos
        };
      })
    };

    res.json(tree);
  } catch (error) {
    console.error('Tree error', error);
    res.status(500).json({ error: 'Database error' });
  }
};

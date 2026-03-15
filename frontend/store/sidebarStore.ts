import { create } from 'zustand';

interface VideoNode {
  id: number;
  title: string;
  order_index: number;
  is_completed: boolean;
  locked: boolean;
}

interface SectionNode {
  id: number;
  title: string;
  order_index: number;
  videos: VideoNode[];
}

interface TreeData {
  id: number;
  title: string;
  sections: SectionNode[];
}

interface SidebarState {
  tree: TreeData | null;
  loading: boolean;
  error: string | null;
  
  setTree: (tree: TreeData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markVideoCompleted: (videoId: number) => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  tree: null,
  loading: false,
  error: null,

  setTree: (tree) => set({ tree }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  markVideoCompleted: (videoId) => {
    const { tree } = get();
    if (!tree) return;

    // Deep clone to avoid mutating state directly
    const updatedTree = JSON.parse(JSON.stringify(tree)) as TreeData;
    let found = false;
    let previousCompleted = true; // First video is always unlocked

    for (const section of updatedTree.sections) {
      for (const video of section.videos) {
        if (video.id === videoId) {
          video.is_completed = true;
          found = true;
        }

        // Recalculate locked states for the entire tree now that something might have completed
        video.locked = !previousCompleted;
        previousCompleted = video.is_completed;
      }
    }

    if (found) {
      set({ tree: updatedTree });
    }
  }
}));

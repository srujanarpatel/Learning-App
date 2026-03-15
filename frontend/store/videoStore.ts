import { create } from 'zustand';

interface VideoState {
  currentVideo: any | null;
  subjectId: string | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isCompleted: boolean;
  nextVideo: any | null;
  prevVideo: any | null;
  
  setCurrentVideo: (video: any) => void;
  setSubjectId: (id: string) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsCompleted: (completed: boolean) => void;
  setAdjacentVideos: (prev: any, next: any) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  currentVideo: null,
  subjectId: null,
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  isCompleted: false,
  nextVideo: null,
  prevVideo: null,

  setCurrentVideo: (video) => set({ currentVideo: video }),
  setSubjectId: (id) => set({ subjectId: id }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsCompleted: (isCompleted) => set({ isCompleted }),
  setAdjacentVideos: (prevVideo, nextVideo) => set({ prevVideo, nextVideo })
}));

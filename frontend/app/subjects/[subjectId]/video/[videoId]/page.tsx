'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import VideoPlayer from '@/components/Video/VideoPlayer';
import { useSidebarStore } from '@/store/sidebarStore';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import VideoProgressBar from '@/components/Video/VideoProgressBar';

export default function VideoPage() {
  const router = useRouter();
  const params = useParams() as { subjectId?: string, videoId?: string };
  const subjectId = params.subjectId || '';
  const videoId = params.videoId || '';
  const { markVideoCompleted } = useSidebarStore();
  
  const [videoData, setVideoData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchVideoInfo = async () => {
      setLoading(true);
      setError(null);
      if (!videoId) return;
      try {
        const [videoRes, progressRes] = await Promise.all([
          apiClient.get(`/videos/${videoId}`),
          apiClient.get(`/progress/videos/${videoId}`)
        ]);
        
        if (videoRes.data.locked) {
          setError(videoRes.data.unlock_reason || 'This video is locked. Complete previous lessons first.');
        } else {
          setVideoData(videoRes.data);
          setProgressData(progressRes.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load video');
      } finally {
        setLoading(false);
      }
    };
    fetchVideoInfo();
  }, [videoId]);

  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (progressData) {
        setCurrentTime(progressData.last_position_seconds || 0);
    }
  }, [progressData]);

  const handleProgress = async (newTime: number) => {
    setCurrentTime(newTime);
    if (updating || !videoData || progressData?.is_completed || !videoId) return;
    
    try {
      setUpdating(true);
      await apiClient.post(`/progress/videos/${videoId}`, {
        last_position_seconds: newTime,
        is_completed: false
      });
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleted = async () => {
    if (!videoId) return;
    try {
      await apiClient.post(`/progress/videos/${videoId}`, {
        last_position_seconds: videoData.duration_seconds || 0,
        is_completed: true
      });
      markVideoCompleted(Number(videoId));
      setProgressData((prev: any) => ({ ...prev, is_completed: true }));
      
      // Auto navigate to next
      if (videoData.next_video_id) {
        setTimeout(() => {
          router.push(`/subjects/${subjectId}/video/${videoData.next_video_id}`);
        }, 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-10 animate-pulse text-gray-400">Loading video...</div>;
  
  if (error) return (
    <div className="p-12 text-center text-red-500">
      <div className="bg-red-50 inline-block p-6 rounded-2xl border border-red-100">
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p>{error}</p>
        <button 
          onClick={() => router.push(`/subjects/${subjectId}`)}
          className="mt-6 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          Back to Course Overview
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-primary-600 mb-1">{videoData?.section_title}</div>
          <h1 className="text-3xl font-bold text-gray-900">{videoData?.title}</h1>
        </div>
        
        {progressData?.is_completed && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100 font-medium">
            <CheckCircle2 className="w-5 h-5" />
            Completed
          </div>
        )}
      </div>

      <div className="mb-8">
        <VideoPlayer 
          videoId={videoData.id}
          youtubeUrl={videoData.youtube_url}
          startPositionSeconds={progressData?.last_position_seconds || 0}
          onProgress={handleProgress}
          onCompleted={handleCompleted}
        />
        <VideoProgressBar currentTime={currentTime} duration={videoData.duration_seconds || 0} />
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        {videoData?.previous_video_id ? (
          <button 
            onClick={() => router.push(`/subjects/${subjectId}/video/${videoData.previous_video_id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous Lesson
          </button>
        ) : <div />}

        {videoData?.next_video_id ? (
          <button 
            onClick={() => router.push(`/subjects/${subjectId}/video/${videoData.next_video_id}`)}
            className="flex items-center gap-2 text-white bg-primary-600 px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            Next Lesson
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="text-sm text-gray-500 font-medium bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            Course Completed
          </div>
        )}
      </div>

      <div className="mt-10 prose max-w-none text-gray-600 bg-gray-50 p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Lesson Description</h3>
        <p>{videoData?.description || 'No description provided.'}</p>
      </div>
    </div>
  );
}

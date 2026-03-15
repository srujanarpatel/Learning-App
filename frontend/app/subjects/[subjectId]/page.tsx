'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSidebarStore } from '@/store/sidebarStore';
import apiClient from '@/lib/apiClient';
import { PlayCircle, Award, Clock } from 'lucide-react';
import clsx from 'clsx';

export default function SubjectPage() {
  const router = useRouter();
  const params = useParams() as { subjectId?: string };
  const subjectId = params.subjectId || '';
  const { tree } = useSidebarStore();
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        if (subjectId) {
          const { data } = await apiClient.get(`/progress/subjects/${subjectId}`);
          setProgress(data);
        }
      } catch (e) {}
    };
    fetchProgress();
  }, [subjectId]);

  const handleContinue = () => {
    if (progress?.last_video_id) {
      router.push(`/subjects/${subjectId}/video/${progress.last_video_id}`);
    } else if (tree?.sections?.[0]?.videos?.[0]) {
      router.push(`/subjects/${subjectId}/video/${tree.sections[0].videos[0].id}`);
    }
  };

  if (!tree) return null;

  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-700 p-8 flex flex-col justify-end text-white">
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight drop-shadow-md">{tree.title}</h1>
          <p className="text-indigo-100 font-medium tracking-wide">Course Overview</p>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-indigo-50 rounded-xl p-6 flex flex-col items-center justify-center border border-indigo-100">
              <Clock className="w-8 h-8 text-indigo-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{progress?.percent_complete || 0}%</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Completed</div>
            </div>
            
            <div className="bg-emerald-50 rounded-xl p-6 flex flex-col items-center justify-center border border-emerald-100">
              <Award className="w-8 h-8 text-emerald-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{progress?.completed_videos || 0} / {progress?.total_videos || 0}</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Lessons Done</div>
            </div>
            
            <div className="flex items-center justify-center">
              <button 
                onClick={handleContinue}
                className="w-full h-full bg-primary-600 text-white font-bold text-lg rounded-xl shadow-md hover:bg-primary-700 hover:shadow-lg transition-all flex flex-col items-center justify-center p-6"
              >
                <PlayCircle className="w-10 h-10 mb-2" />
                <span>{progress?.percent_complete > 0 ? 'Continue Learning' : 'Start Course'}</span>
              </button>
            </div>
          </div>
          
          <div className="prose max-w-none text-gray-600">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">About this course</h3>
            <p>Welcome to {tree.title}! This course is designed to guide you through mastering the subject step-by-step.</p>
            <p>Use the sidebar to navigate between sections and video lessons. Your progress is automatically saved so you can resume anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

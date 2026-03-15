'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import AppShell from '@/components/Layout/AppShell';
import { Award, Clock, BookOpen } from 'lucide-react';

function SubjectProgressCard({ subject }: { subject: any }) {
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await apiClient.get(`/progress/subjects/${subject.id}`);
        setProgress(data);
      } catch (err) {}
    };
    fetchProgress();
  }, [subject.id]);

  if (!progress) return null;

  return (
    <Link href={`/subjects/${subject.id}`} className="block bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 bg-gradient-to-b from-primary-400 to-indigo-600 h-full"></div>
      <div className="pl-4">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{subject.title}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{subject.description}</p>
        
        <div className="mt-6">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-gray-700">Progress</span>
            <span className="text-primary-600 font-bold">{progress.percent_complete}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progress.percent_complete}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-5 flex items-center justify-between text-sm text-gray-600 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-1.5 font-medium">
            <Award className="w-4 h-4 text-emerald-500" />
            <span>{progress.completed_videos} / {progress.total_videos} lessons</span>
          </div>
          <div className="font-semibold text-primary-600">
            {progress.percent_complete === 100 ? 'Completed' : 'Continue'} &rarr;
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await apiClient.get('/subjects');
        setSubjects(data);
      } catch (err) {}
    };
    fetchSubjects();
  }, []);

  return (
    <AppShell>
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-tr from-primary-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-gray-800">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{user?.name}</h1>
            <p className="text-gray-300 font-medium tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4" /> Member since today
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2 border-b border-gray-200 pb-4">
          <BookOpen className="w-6 h-6 text-primary-600" />
          My Learning Path
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <SubjectProgressCard key={subject.id} subject={subject} />
          ))}
        </div>
        
        {subjects.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <h3 className="text-xl font-medium text-gray-700">No active courses</h3>
            <p className="mt-2 text-gray-500 mb-6">Browse our catalog to get started</p>
            <Link href="/subjects" className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
              Browse Catalog
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}

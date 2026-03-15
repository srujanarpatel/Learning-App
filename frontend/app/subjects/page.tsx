'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import Link from 'next/link';
import { BookOpen, Clock, PlayCircle } from 'lucide-react';

interface Subject {
  id: number;
  title: string;
  slug: string;
  description: string;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await apiClient.get('/subjects');
        setSubjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading courses...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Available Courses</h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">Enhance your skills with our expert-led courses.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjects.map(subject => (
          <Link href={`/subjects/${subject.id}`} key={subject.id} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="h-48 bg-gradient-to-br from-primary-500 to-indigo-600 flex flex-col justify-end p-6">
              <BookOpen className="w-12 h-12 text-white/20 absolute top-6 right-6" />
              <h2 className="text-2xl font-bold text-white relative z-10 leading-tight">{subject.title}</h2>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <p className="text-gray-600 mb-6 flex-1 line-clamp-3">{subject.description}</p>
              <div className="flex items-center justify-between text-sm font-medium pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-primary-600">
                  <PlayCircle className="w-5 h-5" />
                  <span>Start Learning</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {subjects.length === 0 && (
        <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900">No courses available</h3>
          <p className="mt-2">Check back later for new content.</p>
        </div>
      )}
    </div>
  );
}

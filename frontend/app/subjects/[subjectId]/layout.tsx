'use client';

import { useEffect } from 'react';
import { useSidebarStore } from '@/store/sidebarStore';
import apiClient from '@/lib/apiClient';
import SubjectSidebar from '@/components/Sidebar/SubjectSidebar';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function SubjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams() as { subjectId?: string };
  const subjectId = params.subjectId || '';
  const { setTree, setLoading, loading, error, setError } = useSidebarStore();

  useEffect(() => {
    const fetchTree = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.get(`/subjects/${subjectId}/tree`);
        setTree(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load course structure');
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) fetchTree();
  }, [subjectId, setTree, setLoading, setError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] w-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 justify-center h-[calc(100vh-64px)] w-full text-red-500">
        <AlertCircle className="w-10 h-10" />
        <h2 className="text-xl font-bold">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
      <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col h-full overflow-y-auto custom-scrollbar">
        <SubjectSidebar subjectId={subjectId} />
      </div>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

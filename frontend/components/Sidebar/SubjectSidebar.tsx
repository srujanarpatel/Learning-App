'use client';

import { useSidebarStore } from '@/store/sidebarStore';
import SectionItem from './SectionItem';

export default function SubjectSidebar({ subjectId }: { subjectId: string }) {
  const { tree } = useSidebarStore();

  if (!tree) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 line-clamp-2">{tree.title}</h2>
        <div className="mt-2 text-sm text-gray-500 font-medium">Course Content</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tree.sections?.map(section => (
          <SectionItem key={section.id} section={section} subjectId={subjectId} />
        ))}
        {(!tree.sections || tree.sections.length === 0) && (
          <div className="p-6 text-center text-gray-400">
            No sections available yet.
          </div>
        )}
      </div>
    </div>
  );
}

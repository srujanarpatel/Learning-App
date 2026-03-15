import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronUp, Lock, CheckCircle2, PlayCircle } from 'lucide-react';
import clsx from 'clsx';

export default function SectionItem({
  section,
  subjectId
}: {
  section: any;
  subjectId: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const completedCount = section.videos.filter((v: any) => v.is_completed).length;

  return (
    <div className="border-b border-gray-200 bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 focus:outline-none transition-colors"
      >
        <div className="flex flex-col text-left">
          <span className="font-semibold text-gray-900 line-clamp-2">{section.title}</span>
          <span className="text-xs text-gray-500 mt-1 font-medium tracking-wide">
            {completedCount} / {section.videos.length} completed
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {isOpen && (
        <div className="bg-white">
          {section.videos.map((video: any) => {
            const isActive = pathname === `/subjects/${subjectId}/video/${video.id}`;
            return (
              <div key={video.id} className={clsx("relative px-4 py-3 border-l-4 transition-colors", isActive ? "border-primary-600 bg-primary-50" : "border-transparent hover:bg-gray-50")}>
                {video.locked && (
                  <div className="absolute inset-0 bg-white/60 z-10 cursor-not-allowed"></div>
                )}
                
                <Link
                  href={video.locked ? '#' : `/subjects/${subjectId}/video/${video.id}`}
                  onClick={(e) => {
                    if (video.locked) e.preventDefault();
                  }}
                  className="flex items-start gap-3 w-full"
                >
                  <div className="mt-0.5 mt-0 flex-shrink-0">
                    {video.locked ? (
                      <Lock className="w-5 h-5 text-gray-300" />
                    ) : video.is_completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <PlayCircle className={clsx("w-5 h-5", isActive ? "text-primary-600" : "text-gray-400")} />
                    )}
                  </div>
                  
                  <div className="flex flex-col text-left text-sm">
                    <span className={clsx("font-medium", isActive ? "text-primary-700" : "text-gray-700", video.locked && "text-gray-400")}>
                      {video.title}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

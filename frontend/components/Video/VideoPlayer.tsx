'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoPlayerProps {
  videoId: number;
  youtubeUrl: string; // e.g., https://www.youtube.com/embed/{id}
  startPositionSeconds: number;
  onProgress: (currentTime: number) => void;
  onCompleted: () => void;
}

export default function VideoPlayer({
  videoId,
  youtubeUrl,
  startPositionSeconds,
  onProgress,
  onCompleted
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Extract youtube ID from embed URL
  const ytIdMatch = youtubeUrl.match(/\/embed\/([a-zA-Z0-9_-]+)/);
  const ytVideoId = ytIdMatch ? ytIdMatch[1] : '';

  useEffect(() => {
    // Reset player state when video changes
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    
    setIsReady(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!ytVideoId) return;

    const loadPlayer = () => {
      playerRef.current = new window.YT.Player(`youtube-player-${videoId}`, {
        videoId: ytVideoId,
        playerVars: {
          start: startPositionSeconds,
          autoplay: 1,
          rel: 0,
          modestbranding: 1
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            // Sometimes autoplay doesn't trigger due to browser policies, so try to play
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              if (!intervalRef.current) {
                intervalRef.current = setInterval(() => {
                  if (playerRef.current?.getCurrentTime) {
                    onProgress(Math.floor(playerRef.current.getCurrentTime()));
                  }
                }, 5000); // Progress every 5 seconds
              }
            } else {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
            }

            if (event.data === window.YT.PlayerState.ENDED) {
              onCompleted();
            }
          }
        }
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        loadPlayer();
      };
    } else {
      loadPlayer();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [videoId, ytVideoId]); // Re-init when videoId changes

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      <div id={`youtube-player-${videoId}`} className="w-full h-full"></div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Orb from "@/components/Orb";

// A welcome moment on the path screen. Attempts a D-ID talking-head greeting;
// if the avatar isn't available (no key, error, or still building), it shows
// Lumora's glowing orb instead — so this never degrades the experience.
export default function AvatarWelcome({ projectName }) {
  const [state, setState] = useState("loading"); // loading | video | orb
  const [videoUrl, setVideoUrl] = useState(null);
  const triedRef = useRef(false);

  const greeting = projectName
    ? `Welcome to Lumora. I'm your mentor, and together we'll build ${projectName}. Open any step whenever you're ready, and we'll learn it together.`
    : `Welcome to Lumora. I'm your mentor. Open any step whenever you're ready, and we'll learn it together.`;

  useEffect(() => {
    if (triedRef.current) return;
    triedRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: greeting }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.available && data.videoUrl) {
          setVideoUrl(data.videoUrl);
          setState("video");
        } else {
          setState("orb");
        }
      } catch {
        if (!cancelled) setState("orb");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center text-center mb-10">
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden flex items-center justify-center">
        {/* glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-ember-400/25 to-amber-400/20 blur-md" />

        {state === "video" && videoUrl ? (
          <video
            src={videoUrl}
            autoPlay
            playsInline
            controls={false}
            onEnded={(e) => {
              // gentle: loop back to a calm first frame by pausing at start
              try {
                e.currentTarget.currentTime = 0;
                e.currentTarget.pause();
              } catch {}
            }}
            className="relative w-full h-full object-cover rounded-full"
          />
        ) : state === "loading" ? (
          <div className="relative flex flex-col items-center">
            <Orb size={150} />
          </div>
        ) : (
          <Orb size={150} />
        )}
      </div>

      <p className="mt-4 font-display italic text-espresso-700 text-sm">
        {state === "loading"
          ? "your mentor is arriving…"
          : "your mentor, ready"}
      </p>
    </div>
  );
}

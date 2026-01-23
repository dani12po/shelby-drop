"use client";

import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

/* ===============================
   PROPS
================================ */
type Props = {
  src: string;
  autoPlay?: boolean;
  onError?: () => void;
};

/* ===============================
   COMPONENT
================================ */
export default function AudioWaveform({
  src,
  autoPlay = false,
  onError,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(
    null
  );
  const waveRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const wave = WaveSurfer.create({
        container: containerRef.current,
        waveColor: "#9ca3af",
        progressColor: "#ffffff",
        cursorColor: "#ffffff",
        height: 80,
        barWidth: 2,
        barGap: 2,
        normalize: true,
      });

      wave.load(src);

      if (autoPlay) {
        wave.on("ready", () => {
          wave.play();
        });
      }

      waveRef.current = wave;

      return () => {
        wave.destroy();
        waveRef.current = null;
      };
    } catch {
      onError?.();
    }
  }, [src, autoPlay, onError]);

  return (
    <div className="rounded-xl bg-black/40 p-4">
      <div ref={containerRef} />
    </div>
  );
}

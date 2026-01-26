"use client";

import AudioWaveform from "./AudioWaveform";

type Props = {
  src: string;
  autoPlay?: boolean;
};

export default function AudioPreview({
  src,
  autoPlay = true,
}: Props) {
  return (
    <AudioWaveform
      src={src}
      autoPlay={autoPlay}
    />
  );
}

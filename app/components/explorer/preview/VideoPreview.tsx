"use client";

type Props = {
  src: string;
};

export default function VideoPreview({ src }: Props) {
  return (
    <video
      src={src}
      controls
      autoPlay
      className="w-full max-h-[60vh] rounded-xl bg-black"
    />
  );
}

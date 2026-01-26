"use client";

import AudioPreview from "./AudioPreview";
import VideoPreview from "./VideoPreview";
import TextPreview from "./TextPreview";
import ImagePreview from "./ImagePreview";
import UnknownPreview from "./UnknownPreview";

import { RenderResult } from "../context-menu/types";

type Props = {
  src: string;
  ext: string;
  filename: string;

  content?: string;
  result?: RenderResult;

  viewMode?: "preview" | "raw" | "tree";
  onChangeViewMode?: (mode: "preview" | "raw" | "tree") => void;
};

function isAudio(ext: string) {
  return [".mp3", ".wav", ".ogg"].includes(ext);
}

function isVideo(ext: string) {
  return [".mp4", ".webm"].includes(ext);
}

function isImage(ext: string) {
  return [".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext);
}

export default function MediaPreview({
  src,
  ext,
  filename,
  content,
  result,
  viewMode = "preview",
  onChangeViewMode,
}: Props) {
  if (isAudio(ext)) {
    return <AudioPreview src={src} autoPlay />;
  }

  if (isVideo(ext)) {
    return <VideoPreview src={src} />;
  }

  if (isImage(ext)) {
    return <ImagePreview src={src} />;
  }

  if (content && result) {
    return (
      <TextPreview
        content={content}
        result={result}
        viewMode={viewMode}
        onChangeViewMode={onChangeViewMode}
      />
    );
  }

  return <UnknownPreview filename={filename} />;
}

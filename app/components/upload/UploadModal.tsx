"use client";

import UploadPanel from "./UploadPanel";

type Props = {
  wallet: string;
  onClose: () => void;
  onUploaded?: (url: string) => void;
};

export default function UploadModal({ wallet, onClose, onUploaded }: Props) {
  return (
    <UploadPanel
      open={true}
      onClose={onClose}
      onUploaded={() => onUploaded?.('')}
      path={[]}
    />
  );
}

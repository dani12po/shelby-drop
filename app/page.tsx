"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [blobId, setBlobId] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [type, setType] = useState<"image" | "video" | "file" | null>(null);

  /* === CLIENT ONLY === */
  useEffect(() => {
    setOrigin(window.location.origin);

    const p = new URLSearchParams(window.location.search);
    const b = p.get("blob");
    const n = p.get("name");

    if (b && n) {
      setBlobId(b);
      setFilename(n);
      detectType(n);
    }
  }, []);

  function parseInput() {
    if (!input) return;

    // Jika user paste URL
    if (input.startsWith("http")) {
      try {
        const parts = input.split("/blobs/")[1];
        const [id, name] = parts.split("/");
        setBlobId(id);
        setFilename(name);
        detectType(name);
        return;
      } catch {
        alert("Invalid Shelby blob URL");
      }
    }

    alert("Please paste a valid Shelby blob URL");
  }

  function detectType(name: string) {
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(name)) {
      setType("image");
    } else if (/\.(mp4|webm|mov|mkv)$/i.test(name)) {
      setType("video");
    } else {
      setType("file");
    }
  }

  function shareLink() {
    if (!blobId || !filename) return;
    const link = `${origin}/?blob=${blobId}&name=${filename}`;
    navigator.clipboard.writeText(link);
    alert("Share link copied!");
  }

  const downloadUrl =
    blobId && filename
      ? `https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${blobId}/${filename}`
      : null;

  return (
    <div className="container">
      <h1>Shelby Drop</h1>
      <p className="tagline">Download & share Shelby blobs easily</p>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste Shelby blob URL here"
      />

      <button onClick={parseInput}>Load File</button>

      {downloadUrl && (
        <>
          <div className="preview">
            {type === "image" && <img src={downloadUrl} />}
            {type === "video" && <video src={downloadUrl} controls />}
            {type === "file" && <p>📄 {filename}</p>}
          </div>

          <div className="actions">
            <a className="download-btn" href={downloadUrl} download>
              ⬇ Download
            </a>

            <button className="share-btn" onClick={shareLink}>
              🔗 Share
            </button>
          </div>

          <div className="code">{downloadUrl}</div>
        </>
      )}
    </div>
  );
}

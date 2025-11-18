"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  aspect?: "square" | "landscape" | "portrait";
};

export default function WebcamCapture({ open, onClose, onCapture, aspect = "square" }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e: any) {
        setError(e?.message || "Cannot access camera");
      }
    })();
    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [open]);

  const capture = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    // Calculate canvas size based on aspect
    let targetW = width;
    let targetH = height;
    if (aspect === "square") {
      const size = Math.min(width, height);
      targetW = size; targetH = size;
    } else if (aspect === "landscape") {
      const ratio = 16/9;
      targetW = width;
      targetH = Math.round(width / ratio);
      if (targetH > height) { targetH = height; targetW = Math.round(height * ratio); }
    } else if (aspect === "portrait") {
      const ratio = 3/4;
      targetH = height;
      targetW = Math.round(height * ratio);
      if (targetW > width) { targetW = width; targetH = Math.round(width / ratio); }
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw centered crop
    const sx = Math.max(0, (width - targetW) / 2);
    const sy = Math.max(0, (height - targetH) / 2);
    ctx.drawImage(video, sx, sy, targetW, targetH, 0, 0, targetW, targetH);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9));
    if (!blob) return;
    const file = new File([blob], "webcam.jpg", { type: "image/jpeg" });
    onCapture(file);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded shadow-lg p-4 w-full max-w-lg">
        <div className="text-lg font-semibold mb-2">Ambil Foto via Webcam</div>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="relative w-full aspect-video bg-black overflow-hidden rounded">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <button onClick={onClose} className="border rounded px-4 py-2">Batal</button>
          <button onClick={capture} className="bg-black text-white rounded px-4 py-2">Ambil</button>
        </div>
      </div>
    </div>
  );
}

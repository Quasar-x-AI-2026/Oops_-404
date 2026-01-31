import React, { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import TargetCursor from "./Design/TargetCursor.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Eye, Aperture, Activity, Wifi } from "lucide-react";

// Video Data (Moved here to ensure consistent state/UI control)
const VIDEOS = [
  { id: "B3Z4XGAxJB0", title: "Beautiful Nature", category: "Nature", thumbnail: "https://img.youtube.com/vi/B3Z4XGAxJB0/maxresdefault.jpg" },
  { id: "DuudSp4sHmg", title: "Rain Sounds", category: "Relaxation", thumbnail: "https://img.youtube.com/vi/DuudSp4sHmg/maxresdefault.jpg" },
  { id: "LXb3EKWsInQ", title: "Costa Rica 4K", category: "Travel", thumbnail: "https://img.youtube.com/vi/LXb3EKWsInQ/maxresdefault.jpg" },
];

export default function FaceCursor() {
  const videoRef = useRef(null);
  const cursorRef = useRef(null);
  const socketRef = useRef(null);
  const blinkCounterRef = useRef(0);

  // State to track which video is playing
  const [activeVideo, setActiveVideo] = useState(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);

  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:8000/ws");

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!cursorRef.current) return;

      const cursorX = data.x * window.innerWidth;
      const cursorY = data.y * window.innerHeight;

      cursorRef.current.style.left = `${cursorX}px`;
      cursorRef.current.style.top = `${cursorY}px`;

      // If the backend sends a "click" action, we find what's under the cursor
      if (data.action === "click") {
        const elementAtPoint = document.elementFromPoint(cursorX, cursorY);
        if (elementAtPoint) elementAtPoint.click();
      }
    };

    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      const detected = results.multiFaceLandmarks?.length > 0;
      setIsFaceDetected(detected);

      if (!detected) return;
      const landmarks = results.multiFaceLandmarks[0];

      // Blink Detection (Left Eye)
      const top = landmarks[159];
      const bottom = landmarks[145];
      const eyeDistance = Math.abs(top.y - bottom.y);

      let action = "move";
      if (eyeDistance < 0.015) {
        blinkCounterRef.current += 1;
        // Reduced to 2 frames to detect a single deliberate blink
        if (blinkCounterRef.current === 2) {
          action = "click";
        }
      } else {
        blinkCounterRef.current = 0;
      }

      const nose = landmarks[1];
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ x: nose.x, y: nose.y, action }));
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await faceMesh.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });
    camera.start();

    return () => {
      camera.stop();
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden font-['Roboto_Condensed',sans-serif] selection:bg-cyan-500/30">

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />

      {/* 1. Custom Cursor */}
      <TargetCursor
        ref={cursorRef}
        spinDuration={2}
        hideDefaultCursor
        parallaxOn
        hoverDuration={0.2}
        color="#06b6d4" // Cyan cursor to match theme
      />

      {/* Main Layout */}
      <div
        className={`relative z-10 transition-all duration-700 ease-in-out ${activeVideo ? "blur-xl" : "blur-0"}`}
        style={{ height: "100%" }}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-8 md:px-16">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 border border-cyan-500/30 rounded-lg bg-cyan-950/10 backdrop-blur-sm">
              <Eye className="w-5 h-5 text-cyan-400" />
              <div className="absolute inset-0 border border-cyan-500/20 rounded-lg animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-500 uppercase">
                THIRD EYE
              </h1>
              <p className="text-[12px] text-cyan-500/60 uppercase tracking-widest font-mono">
                System Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Wifi className={`w-3 h-3 ${socketRef.current ? "text-green-500" : "text-red-500"}`} />
              <span>LINK: {socketRef.current ? "CONNECTED" : "OFFLINE"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className={`w-3 h-3 ${isFaceDetected ? "text-green-500" : "text-amber-600"}`} />
              <span>TRACKING: {isFaceDetected ? "LOCKED" : "SEARCHING"}</span>
            </div>
          </div>
        </header>

        {/* Gallery Content */}
        <main className="container mx-auto px-6 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {VIDEOS.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                onClick={() => setActiveVideo(video.id)}
                className="group relative cursor-target"
              >
                {/* Card Container */}
                <div className="relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-white/5 shadow-2xl transition-all duration-500 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]">
                  {/* Thumbnail Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100 delay-75">
                      <div className="w-16 h-16 rounded-full bg-cyan-500/20 backdrop-blur-md border border-cyan-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                        <Play className="w-6 h-6 text-cyan-100 ml-1 fill-cyan-100" />
                      </div>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="absolute bottom-0 left-0 w-full p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase tracking-wider font-mono text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-500/20">
                        {video.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-white group-hover:text-cyan-200 transition-colors">
                      {video.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>

      {/* Modal - AnimatePresence allows for exit animations */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-12"
            onClick={() => setActiveVideo(null)}
          >
            {/* Close Button */}
            <button
              className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all duration-300 z-50 cursor-target group"
              onClick={() => setActiveVideo(null)}
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_50px_-10px_rgba(6,182,212,0.15)] border border-white/10 bg-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                className="w-full h-full cursor-target"
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />

              {/* Instructions Overlay (fades out) */}
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 3, duration: 1 }}
                className="absolute bottom-8 left-0 w-full text-center pointer-events-none"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs text-white/70 font-mono">
                  <Aperture className="w-4 h-4 text-cyan-500" />
                  BLINK 1 TIME ON BACKDROP TO CLOSE
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Preview HUD */}
      <div className="fixed bottom-6 right-6 z-40 group">
        <div className="relative rounded-2xl overflow-hidden border border-white/10 group-hover:border-cyan-500/40 transition-colors duration-500 shadow-2xl w-[180px] bg-black">
          {/* Scanning Line Animation */}
          <div className="absolute inset-0 w-full h-1 bg-cyan-500/50 blur-[2px] animate-[scan_2s_linear_infinite]" />

          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full transform scale-x-[-1] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
          />

          {/* Corner Accents */}
          <div className="absolute top-2 left-2 w-2 h-2 border-l-2 border-t-2 border-cyan-500/50" />
          <div className="absolute top-2 right-2 w-2 h-2 border-r-2 border-t-2 border-cyan-500/50" />
          <div className="absolute bottom-2 left-2 w-2 h-2 border-l-2 border-b-2 border-cyan-500/50" />
          <div className="absolute bottom-2 right-2 w-2 h-2 border-r-2 border-b-2 border-cyan-500/50" />
        </div>
      </div>

    </div>
  );
}
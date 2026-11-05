"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { useSpatialStore } from '@/lib/store';
import {
  Glasses,
  Maximize2,
  Minimize2,
  Hand,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Layers,
  Compass,
  Move3d,
  CheckCircle2,
  Eye,
  Sliders,
  Cpu,
  Radio
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SpatialCanvas() {
  const {
    webxrMode,
    setWebxrMode,
    spatialBinauralAudio,
    toggleSpatialBinauralAudio,
    dnaRotationSpeed,
    setDnaRotationSpeed
  } = useSpatialStore();

  const [activeGesture, setActiveGesture] = useState<'idle' | 'pinch' | 'drag' | 'expand'>('idle');
  const [selectedNode, setSelectedNode] = useState<string | null>("vllm");
  const [spatialAudioPosition, setSpatialAudioPosition] = useState({ x: 0.0, y: 1.2, z: -2.5 });
  const [gaussianSplatFps, setGaussianSplatFps] = useState(89.4);
  const [headGazeAngle, setHeadGazeAngle] = useState({ pitch: 4.2, yaw: -8.5 });

  // 3D Volumetric Skill Constellation Nodes
  const volumetricNodes = [
    { id: "math", label: "Linear Algebra & Probability", x: -20, y: 15, z: -10, color: "#818cf8", affinity: 0.94, level: "Foundation" },
    { id: "attention", label: "Attention Mechanisms", x: -5, y: 25, z: -5, color: "#a855f7", affinity: 0.91, level: "Core AI" },
    { id: "transformers", label: "Deep Learning / Transformers", x: 15, y: 30, z: 0, color: "#ec4899", affinity: 0.88, level: "Architecture" },
    { id: "vllm", label: "vLLM PagedAttention", x: 35, y: 40, z: 15, color: "#06b6d4", affinity: 0.98, level: "Surging (+400%)" },
    { id: "distributed", label: "Distributed Consensus (Raft)", x: 25, y: -10, z: 5, color: "#10b981", affinity: 0.86, level: "Infrastructure" },
    { id: "pqc", label: "NIST ML-DSA Dilithium-3", x: -25, y: -15, z: -8, color: "#f59e0b", affinity: 0.93, level: "Quantum-Resilient" }
  ];

  const handleGestureTrigger = (gesture: 'pinch' | 'drag' | 'expand') => {
    setActiveGesture(gesture);
    setTimeout(() => setActiveGesture('idle'), 1800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
              Pillar 1: WebXR & visionOS Native Workspaces
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              90 FPS WebGPU Gaussian Splatting
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-2 flex items-center gap-3">
            <Glasses className="w-8 h-8 text-indigo-400" />
            Neuro-Spatial Computing & Volumetric Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Transcend 2D displays with room-scale volumetric skill DNA constellations, visionOS hand-tracking
            gestures, photorealistic 3D Gaussian Splatting avatar interviewers, and binaural 3D spatial audio.
          </p>
        </div>

        {/* Spatial Immersion Selector */}
        <div className="flex items-center bg-black/50 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setWebxrMode('desktop')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
              webxrMode === 'desktop'
                ? "bg-indigo-500/30 text-indigo-200 border border-indigo-500/40"
                : "text-slate-400 hover:text-white"
            )}
          >
            Desktop 3D
          </button>
          <button
            onClick={() => setWebxrMode('room_canvas')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
              webxrMode === 'room_canvas'
                ? "bg-cyan-500/30 text-cyan-200 border border-cyan-500/40"
                : "text-slate-400 hover:text-white"
            )}
          >
            WebXR Room
          </button>
          <button
            onClick={() => setWebxrMode('visionos_spatial')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
              webxrMode === 'visionos_spatial'
                ? "bg-purple-500/30 text-purple-200 border border-purple-500/40"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Glasses className="w-3.5 h-3.5" />
            visionOS Spatial
          </button>
        </div>
      </div>

      {/* Main 3D Volumetric Canvas & Spatial HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Interactive Volumetric Skill Constellation */}
        <div className="lg:col-span-8 space-y-6">
          <GlassCard className="p-6 border-white/10 relative overflow-hidden bg-gradient-to-b from-indigo-950/20 via-black/60 to-purple-950/20 min-h-[460px] flex flex-col justify-between">
            {/* Ambient Lighting & Perspective Grid simulation */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

            {/* Top HUD Bar */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-cyan-300 flex items-center gap-2">
                  <Move3d className="w-3.5 h-3.5 text-cyan-400" />
                  Volumetric 3D Constellation
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Immersion: <strong className="text-indigo-300 uppercase">{webxrMode}</strong>
                </span>
              </div>

              {/* Hand Gesture Feedback */}
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-mono border transition-all flex items-center gap-1.5",
                  activeGesture !== 'idle'
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse"
                    : "bg-white/5 text-slate-400 border-white/10"
                )}>
                  <Hand className="w-3.5 h-3.5" />
                  Gesture: <strong className="uppercase">{activeGesture}</strong>
                </span>
              </div>
            </div>

            {/* 3D Visual Constellation Diagram Area */}
            <div className="relative h-72 my-4 flex items-center justify-center">
              {/* Central Floating DNA Helix Anchor */}
              <div className="w-28 h-28 rounded-full border border-indigo-500/30 bg-indigo-950/30 flex items-center justify-center animate-pulse shadow-[0_0_40px_rgba(99,102,241,0.25)]">
                <div className="text-center">
                  <span className="text-[10px] font-mono text-indigo-400 block">ROOT ANCHOR</span>
                  <span className="text-xs font-bold text-white">Candidate DNA</span>
                </div>
              </div>

              {/* Floating Volumetric Orbit Nodes */}
              {volumetricNodes.map((node) => {
                const isSelected = selectedNode === node.id;
                return (
                  <motion.div
                    key={node.id}
                    onClick={() => setSelectedNode(node.id)}
                    animate={{
                      scale: isSelected ? 1.15 : 1.0,
                      y: [0, -6, 0]
                    }}
                    transition={{
                      duration: 3 + Math.abs(node.x) * 0.05,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      transform: `translate(${node.x * 4.5}px, ${node.y * 3.5}px)`,
                      boxShadow: isSelected ? `0 0 25px ${node.color}` : 'none'
                    }}
                    className={cn(
                      "absolute cursor-pointer px-3 py-2 rounded-xl border backdrop-blur-md transition-all flex flex-col items-center",
                      isSelected
                        ? "bg-black/90 border-cyan-400 z-20"
                        : "bg-black/60 border-white/15 hover:border-white/40"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: node.color }} />
                      <span className="text-xs font-bold text-white whitespace-nowrap">{node.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {node.level} • {(node.affinity * 100).toFixed(0)}% Affinity
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Gesture Trigger Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">visionOS Gestures:</span>
                <button
                  onClick={() => handleGestureTrigger('pinch')}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-cyan-300 border border-white/10 transition-colors"
                >
                  Pinch (Inspect Gaps)
                </button>
                <button
                  onClick={() => handleGestureTrigger('drag')}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-purple-300 border border-white/10 transition-colors"
                >
                  Drag (Rotate Cluster)
                </button>
                <button
                  onClick={() => handleGestureTrigger('expand')}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-emerald-300 border border-white/10 transition-colors"
                >
                  Expand (Project Roadmap)
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Rotation Velocity:</span>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={dnaRotationSpeed}
                  onChange={(e) => setDnaRotationSpeed(parseFloat(e.target.value))}
                  className="w-20 accent-indigo-400 bg-white/10 rounded h-1.5"
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right 4 Cols: WebGPU Gaussian Splatting & Binaural Studio */}
        <div className="lg:col-span-4 space-y-6">
          {/* Gaussian Splatted Avatar Card */}
          <GlassCard className="p-5 border-white/10 bg-gradient-to-b from-purple-950/20 to-black/60">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">3D Gaussian Splatting Avatar</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {gaussianSplatFps.toFixed(1)} FPS
              </span>
            </div>

            {/* Photorealistic Avatar Viewport Simulation */}
            <div className="h-44 rounded-xl bg-black/60 border border-white/10 relative overflow-hidden flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600/30 to-cyan-500/30 border border-purple-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-slate-200/20 to-transparent border border-white/20 flex items-center justify-center">
                  <span className="text-[10px] font-mono text-cyan-200">INTERVIEWER</span>
                </div>
              </div>

              {/* Head Gaze & Micro-expression overlay */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-slate-400 bg-black/60 px-2 py-1 rounded">
                <span>Pitch: {headGazeAngle.pitch}° | Yaw: {headGazeAngle.yaw}°</span>
                <span className="text-emerald-400">Eye Contact Locked</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-3">
              Replaces static floating spheres with a photorealistic digital AI interviewer rendering micro-gestures and lip-synchronization at 90 FPS on WebGPU.
            </p>
          </GlassCard>

          {/* Binaural Spatial Audio Controls */}
          <GlassCard className="p-5 border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Binaural 3D Spatial Audio</h3>
              </div>
              <button
                onClick={toggleSpatialBinauralAudio}
                className={cn(
                  "p-1.5 rounded-lg border transition-colors",
                  spatialBinauralAudio
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                    : "bg-white/5 text-slate-400 border-white/10"
                )}
              >
                {spatialBinauralAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>HRTF Model:</span>
                  <span className="text-cyan-300">EBU-3D Head-Related</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Interviewer 3D Pos:</span>
                  <span className="text-purple-300">({spatialAudioPosition.x}, {spatialAudioPosition.y}, {spatialAudioPosition.z})</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Reverb Simulation:</span>
                  <span className="text-emerald-300">Executive Boardroom</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSpatialAudioPosition({ x: -1.5, y: 1.2, z: -2.0 })}
                  className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-xs border border-white/10 transition-colors"
                >
                  Left Chair
                </button>
                <button
                  onClick={() => setSpatialAudioPosition({ x: 0.0, y: 1.2, z: -2.5 })}
                  className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-xs border border-white/10 transition-colors"
                >
                  Center Panel
                </button>
                <button
                  onClick={() => setSpatialAudioPosition({ x: 1.5, y: 1.2, z: -2.0 })}
                  className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-xs border border-white/10 transition-colors"
                >
                  Right Chair
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

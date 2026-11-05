"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

interface AudioSphereProps {
  analyzer: AnalyserNode | null;
  fsmState?: string;
}

export function AudioSphere({ analyzer, fsmState = "IDLE" }: AudioSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const dataArray = useMemo(() => {
    if (!analyzer) return new Uint8Array(0);
    return new Uint8Array(analyzer.frequencyBinCount);
  }, [analyzer]);

  // Color & distortion state modulation based on FSM state
  const stateVisuals = useMemo(() => {
    switch (fsmState) {
      case 'LISTENING_VAD':
        return { color: '#06b6d4', emissive: '#0891b2', distort: 0.35, speed: 3.5, intensity: 2.2 };
      case 'PROCESSING_VAD':
        return { color: '#14b8a6', emissive: '#0d9488', distort: 0.5, speed: 4.0, intensity: 2.5 };
      case 'STREAMING_LLM':
        return { color: '#8b5cf6', emissive: '#7c3aed', distort: 0.65, speed: 5.0, intensity: 2.8 };
      case 'PLAYING_AUDIO':
        return { color: '#a855f7', emissive: '#9333ea', distort: 0.55, speed: 4.5, intensity: 2.5 };
      case 'INTERRUPTED':
        return { color: '#f59e0b', emissive: '#d97706', distort: 0.85, speed: 8.0, intensity: 3.5 };
      default: // IDLE
        return { color: '#6366f1', emissive: '#4f46e5', distort: 0.3, speed: 2.0, intensity: 1.8 };
    }
  }, [fsmState]);

  useFrame(() => {
    if (meshRef.current && analyzer) {
      analyzer.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const intensity = average / 128;
      meshRef.current.scale.setScalar(1 + intensity * 0.25);
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
    }
  });

  return (
    <Float speed={stateVisuals.speed} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={stateVisuals.color}
          emissive={stateVisuals.emissive}
          emissiveIntensity={stateVisuals.intensity}
          distort={stateVisuals.distort}
          speed={stateVisuals.speed}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
}

export default AudioSphere;

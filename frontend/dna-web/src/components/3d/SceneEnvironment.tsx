"use client";

import React from 'react';
import * as THREE from 'three';
import { Float, Environment, ContactShadows, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer, ChromaticAberration, Noise, Vignette } from "@react-three/postprocessing";
import { useSpatialStore } from "@/lib/store";

export function SceneEnvironment({ children }: { children: React.ReactNode }) {
  const { performanceMode } = useSpatialStore();
  const isLowPowerMode = performanceMode === 'low';

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#8b5cf6" />
      <pointLight position={[-10, -10, 10]} intensity={1} color="#06b6d4" />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={2} castShadow />

      {/* Environment & Atmosphere */}
      <Environment preset="city" />
      <Sparkles count={200} scale={20} size={2} speed={0.4} color="#6366f1" />
      <ContactShadows opacity={0.4} scale={20} blur={2} far={4.5} />

      {/* Optimized Post-Processing Pipeline */}
      {!isLowPowerMode && (
        <EffectComposer enableNormalPass={false}>
          <Bloom
            intensity={1.2}
            luminanceThreshold={1.0}
            luminanceSmoothing={0.9}
            radius={0.3}
          />
          {/* ChromaticAberration and Noise are disabled by default for performance unless needed for specific high-fidelity scenes */}
          <Vignette offset={0.1} darkness={1.1} />
        </EffectComposer>
      )}

      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        {children}
      </Float>
    </>
  );
}

export default SceneEnvironment;

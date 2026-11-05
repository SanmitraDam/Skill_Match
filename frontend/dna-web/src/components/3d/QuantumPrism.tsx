'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useSpatialStore } from '@/lib/store';

export default function QuantumPrism({ phase }: { phase: 'assembly' | 'ignition' | 'stable' }) {
  const { theme } = useSpatialStore();
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);

  const themeColors = {
    dark: { core: '#C084FC', ring1: '#C084FC', ring2: '#2DD4BF', ring3: '#4f46e5' },
    light: { core: '#6366F1', ring1: '#6366F1', ring2: '#0EA5E9', ring3: '#94a3b8' }
  };

  const colors = themeColors[theme];

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.z += delta * 0.1;
    }
    if (ringsRef.current) {
      const speed = phase === 'ignition' ? 2.0 : 0.5;
      ringsRef.current.rotation.y -= delta * speed;
      ringsRef.current.rotation.x += delta * (speed * 0.5);
    }
  });

  const getScale = () => {
    if (phase === 'assembly') return 0.6;
    if (phase === 'ignition') return 1.3;
    return 1.0;
  };

  const ringColors = useMemo(() => [colors.ring1, colors.ring2, colors.ring3], [theme]);

  return (
    <group ref={groupRef} scale={getScale()}>
      {/* The Prism Core */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={0.5}
          chromaticAberration={0.05}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.1}
          color={phase === 'ignition' ? '#fff' : colors.core}
        />
      </mesh>

      {/* Glowing Wireframe Outer Shell */}
      <mesh scale={1.1}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          color={phase === 'ignition' ? '#fff' : colors.ring2}
          wireframe
          transparent
          opacity={phase === 'assembly' ? 0.2 : 0.5}
        />
      </mesh>

      {/* Rotating Laser Rings */}
      <group ref={ringsRef}>
        {ringColors.map((color, i) => (
          <mesh key={i} rotation={[Math.PI / 2 * (i * 0.5), Math.PI / 4 * i, 0]}>
            <torusGeometry args={[1.4 + i * 0.1, 0.01, 16, 100]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={phase === 'ignition' ? 0.8 : 0.3}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

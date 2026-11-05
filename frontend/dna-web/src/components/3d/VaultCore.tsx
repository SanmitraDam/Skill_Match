'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

export default function VaultCore({ isAuthenticating, isAuthenticated }: { isAuthenticating: boolean; isAuthenticated: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotate faster when authenticating, stop/slow down when authenticated
      const rotationSpeed = isAuthenticating ? 2.0 : isAuthenticated ? 0.1 : 0.5;
      meshRef.current.rotation.y += delta * rotationSpeed;
      meshRef.current.rotation.z += delta * (rotationSpeed * 0.5);

      // Subtle pulse scale
      if (isAuthenticating) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.05);
      } else {
        meshRef.current.scale.setScalar(isAuthenticated ? 1.2 : 1.0);
      }
    }
    if (ringRef.current) {
      ringRef.current.rotation.y -= delta * 1.0;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={0.2}
          chromaticAberration={0.05}
          anisotropy={0.1}
          color={isAuthenticated ? '#00f5a0' : isAuthenticating ? '#facc15' : '#4f46e5'}
        />
      </mesh>

      {/* Outer Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.02, 16, 100]} />
        <meshBasicMaterial
          color={isAuthenticated ? '#00f5a0' : '#4f46e5'}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

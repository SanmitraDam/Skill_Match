'use client';

import React, { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import DNAHelix from './DNAHelix';

function SceneController({ transitionComplete }: { transitionComplete: () => void }) {
  const { camera } = useThree();

  useEffect(() => {
    // Transition from Intro position to Hero position
    // Intro ends at [0,0,5] or similar. We want [0,0,8]
    gsap.to(camera.position, {
      z: 8,
      y: 0,
      x: 0,
      duration: 2,
      ease: 'power3.inOut',
      onComplete: transitionComplete,
    });
  }, [camera, transitionComplete]);

  return null;
}

export default function HeroScene({ onTransitionComplete }: { onTransitionComplete: () => void }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />

      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} color="#00f5a0" intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#06b6d4" intensity={0.5} />

      <Environment preset="city" />

      <DNAHelix />

      <ContactShadows
        opacity={0.4}
        scale={10}
        blur={2}
        far={10}
        resolution={256}
        color="#000"
      />

      <SceneController transitionComplete={onTransitionComplete} />
    </Canvas>
  );
}

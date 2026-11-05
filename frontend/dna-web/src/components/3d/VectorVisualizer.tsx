"use client";

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sphere, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { SkillGapReport } from '@/types/api';

interface VectorVisualizerProps {
  report: SkillGapReport;
}

export function VectorVisualizer({ report }: VectorVisualizerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { matched_skills, missing_critical_skills } = report;

  const allSkills = useMemo(() => {
    return [
      ...matched_skills.map(s => ({ name: s, isMatched: true })),
      ...missing_critical_skills.map(s => ({ name: s, isMatched: false })),
    ];
  }, [matched_skills, missing_critical_skills]);

  // Compute 3D positions for skill nodes in an expansive orbital plane
  const nodes = useMemo(() => {
    const total = allSkills.length;
    if (total === 0) return [];

    return allSkills.map((item, i) => {
      const angle = (i / total) * Math.PI * 2;
      // Matched skills placed along inner orbit (2.6 - 3.0), gaps further along outer perimeter (3.6 - 4.0)
      const baseRadius = item.isMatched ? 2.8 : 3.8;
      // Slight vertical wobble for an immersive 3D constellation
      const zOffset = Math.sin(angle * 2.5) * 0.4;
      
      const x = Math.cos(angle) * baseRadius;
      const y = Math.sin(angle) * baseRadius;
      const z = zOffset;

      return {
        ...item,
        position: new THREE.Vector3(x, y, z),
        color: item.isMatched ? "#10b981" : "#f59e0b",
        glowColor: item.isMatched ? "#34d399" : "#fbbf24",
      };
    });
  }, [allSkills]);

  // Subtle continuous rotation so the constellation feels alive
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Background Radar Rings */}
      <mesh position={[0, 0, -0.05]}>
        <ringGeometry args={[1.8, 1.83, 64]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, 0, -0.05]}>
        <ringGeometry args={[2.8, 2.83, 64]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.25} />
      </mesh>
      <mesh position={[0, 0, -0.05]}>
        <ringGeometry args={[3.8, 3.83, 64]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.2} />
      </mesh>

      {/* Axis crosshair lines */}
      <Line
        points={[new THREE.Vector3(-4.4, 0, -0.05), new THREE.Vector3(4.4, 0, -0.05)]}
        color="#ffffff"
        lineWidth={0.5}
        transparent
        opacity={0.08}
      />
      <Line
        points={[new THREE.Vector3(0, -4.4, -0.05), new THREE.Vector3(0, 4.4, -0.05)]}
        color="#ffffff"
        lineWidth={0.5}
        transparent
        opacity={0.08}
      />

      {/* Center Candidate DNA Nucleus */}
      <group position={[0, 0, 0]}>
        <Sphere args={[0.32, 32, 32]}>
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#7c3aed"
            emissiveIntensity={1.8}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
        <Sphere args={[0.48, 16, 16]}>
          <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.3} />
        </Sphere>
        <Billboard position={[0, -0.6, 0]}>
          <Text
            fontSize={0.22}
            color="#c4b5fd"
            anchorX="center"
            anchorY="top"
            outlineWidth={0.02}
            outlineColor="#090d16"
          >
            DNA CORE
          </Text>
        </Billboard>
      </group>

      {/* Skill Nodes & Connecting Vector Lines */}
      {nodes.map((node, i) => (
        <group key={`${node.name}-${i}`}>
          {/* Vector Line to Center */}
          <Line
            points={[new THREE.Vector3(0, 0, 0), node.position]}
            color={node.color}
            lineWidth={node.isMatched ? 1.2 : 0.8}
            transparent
            opacity={node.isMatched ? 0.5 : 0.28}
          />

          {/* Node Sphere & Billboard Label */}
          <group position={node.position}>
            {/* Outer Glow Sphere */}
            <Sphere args={[0.22, 16, 16]}>
              <meshBasicMaterial
                color={node.glowColor}
                transparent
                opacity={0.22}
              />
            </Sphere>

            {/* Core Node Sphere */}
            <Sphere args={[0.15, 24, 24]}>
              <meshStandardMaterial
                color={node.color}
                emissive={node.color}
                emissiveIntensity={1.9}
                roughness={0.2}
              />
            </Sphere>

            {/* Billboard Label - Always facing user */}
            <Billboard position={[0, 0.32, 0]}>
              <Text
                fontSize={0.24}
                color={node.isMatched ? "#a7f3d0" : "#fed7aa"}
                anchorX="center"
                anchorY="bottom"
                outlineWidth={0.025}
                outlineColor="#090d16"
              >
                {node.name}
              </Text>
            </Billboard>
          </group>
        </group>
      ))}
    </group>
  );
}

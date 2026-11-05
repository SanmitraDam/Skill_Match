'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Html, Sphere, Tube, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useSpatialStore } from '@/lib/store';
import { motion } from 'framer-motion';

interface NodeData {
  position: THREE.Vector3;
  skill: string;
  score: number;
  color: string;
  id: string;
}

export function DNAHelix() {
  const { dnaRotationSpeed, theme } = useSpatialStore();
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const { mouse } = useThree();

  const themeColors = {
    dark: { primary: '#C084FC', secondary: '#2DD4BF' },
    light: { primary: '#6366F1', secondary: '#0EA5E9' }
  };

  const colors = themeColors[theme];

  // Procedural DNA Geometry Generation
  const { nodes, strand1Points, strand2Points } = useMemo(() => {
    const nodes: NodeData[] = [];
    const s1: THREE.Vector3[] = [];
    const s2: THREE.Vector3[] = [];

    const height = 6;
    const radius = 1.2;
    const turns = 2.5;
    const segments = 100;

    const skills = [
      'Python', 'PyMuPDF', 'spaCy', 'FastAPI', 'PyTorch',
      'Cosine Match 0.92', 'React', 'Next.js', 'TypeScript', 'Zustand'
    ];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const p1 = new THREE.Vector3(x1, y, z1);
      s1.push(p1);

      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;
      const p2 = new THREE.Vector3(x2, y, z2);
      s2.push(p2);

      // Add a skill node every few segments
      if (i % 10 === 0) {
        nodes.push({
          id: `node-1-${i}`,
          position: p1,
          skill: skills[Math.floor(i / 10) % skills.length],
          score: 0.85 + Math.random() * 0.15,
          color: colors.primary
        });
        nodes.push({
          id: `node-2-${i}`,
          position: p2,
          skill: skills[(Math.floor(i / 10) + 5) % skills.length],
          score: 0.85 + Math.random() * 0.15,
          color: colors.secondary
        });
      }
    }

    return { nodes, strand1Points: s1, strand2Points: s2 };
  }, [theme, colors.primary, colors.secondary]);

  // Curves for TubeGeometry
  const curve1 = useMemo(() => new THREE.CatmullRomCurve3(strand1Points), [strand1Points]);
  const curve2 = useMemo(() => new THREE.CatmullRomCurve3(strand2Points), [strand2Points]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Constant rotation on the Y axis
      groupRef.current.rotation.y += delta * 0.1 * dnaRotationSpeed;

      // Mouse Parallax - Adjusted for a more dynamic diagonal tilt
      const targetX = -mouse.x * 0.15;
      const targetY = mouse.y * 0.15;

      // Maintain a slight constant tilt for a more cinematic angle
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetY + 0.2, 0.05);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetX + 0.1, 0.05);
    }
  });

  return (
    <group ref={groupRef} rotation={[0.2, 0, 0.1]}>
      {/* Strand 1 */}
      <Tube args={[curve1, 100, 0.04, 8, false]} name="strand1">
        <meshBasicMaterial color={colors.primary} transparent opacity={0.4} />
      </Tube>

      {/* Strand 2 */}
      <Tube args={[curve2, 100, 0.04, 8, false]} name="strand2">
        <meshBasicMaterial color={colors.secondary} transparent opacity={0.4} />
      </Tube>

      {/* Skill Nodes */}
      {nodes.map((node) => (
        <group key={node.id} position={node.position}>
          <Sphere
            args={[0.08, 16, 16]}
            onPointerOver={() => setHoveredNode(node.id)}
            onPointerOut={() => setHoveredNode(null)}
          >
            <MeshTransmissionMaterial
              backside
              samples={8}
              thickness={0.1}
              chromaticAberration={0.05}
              color={hoveredNode === node.id ? '#fff' : node.color}
              emissive={hoveredNode === node.id ? colors.primary : '#000'}
              emissiveIntensity={hoveredNode === node.id ? 2 : 0}
            />
          </Sphere>

          {/* Spatial Badge */}
          {hoveredNode === node.id && (
            <Html distanceFactor={10} center>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pointer-events-none px-3 py-2 rounded-lg theme-card backdrop-blur-md border border-[var(--glass-border)] shadow-xl text-center"
              >
                <div className="text-[var(--accent-primary)] font-bold text-xs uppercase tracking-widest">{node.skill}</div>
                <div className="text-[var(--fg-muted)] text-[10px] font-mono">Match: {(node.score * 100).toFixed(2)}%</div>
              </motion.div>
            </Html>
          )}
        </group>
      ))}

      {/* Connecting Rungs */}
      {nodes.filter(n => n.id.startsWith('node-1')).map((n1, i) => {
        const n2 = nodes.find(n => n.id === `node-2-${n1.id.split('-')[2]}`);
        if (!n2) return null;
        return (
          <Line
            key={`rung-${i}`}
            points={[n1.position, n2.position]}
            color="#ffffff"
            transparent
            opacity={0.15}
            lineWidth={1}
          />
        );
      })}
    </group>
  );
}

export default DNAHelix;

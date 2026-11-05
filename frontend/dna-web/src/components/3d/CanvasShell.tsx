"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { SceneEnvironment } from "./SceneEnvironment";
import { useSpatialStore } from "@/lib/store";

export function CanvasShell({ children }: { children: React.ReactNode }) {
  const { dnaRotationSpeed } = useSpatialStore();

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={dnaRotationSpeed}
        />
        <SceneEnvironment>
          {children}
        </SceneEnvironment>
      </Canvas>
    </div>
  );
}

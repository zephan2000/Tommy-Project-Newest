import React, { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export function Stars({ count = 500 }) {
  // Generate random positions once (memoized) for all stars
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3); // x, y, z for each star
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 200; // spread them out in a 200x200x200 space
    }
    return arr;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        {/* Attach the position array as a buffer attribute */}
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        color="#ffffff"
        sizeAttenuation
        transparent
        opacity={0.8}
      />
    </points>
  );
}


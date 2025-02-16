import React, { useMemo } from "react";
import * as THREE from "three";

export function Stars({ count = 400 }) {
  const positions = useMemo(() => {
    const positionsArray = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Spread stars over a large area (or inside a sphere)
      positionsArray[i3] = (Math.random() - 0.5) * 400;
      positionsArray[i3 + 1] = (Math.random() - 0.5) * 400;
      positionsArray[i3 + 2] = (Math.random() - 0.5) * 400;
    }
    return positionsArray;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.7} color="#ffffff" sizeAttenuation />
    </points>
  );
}

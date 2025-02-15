"use client";

import * as THREE from "three";
import { Torus } from "@react-three/drei";
import {Canvas, ThreeElements, useFrame} from "@react-three/fiber"
import { TorusGeometry } from "three";
import { useRef } from "react";
import React from "react";

function TestTorus()
{
  const TorusRef = useRef<THREE.Mesh>(null);

  useFrame(() =>{
    if(TorusRef.current)
    {
      TorusRef.current.rotation.y += 0.01
    }
  });
  return <Torus ref={TorusRef}></Torus>
  
}


export function Scene() {
  return (
    <div className="fixed inset-0">
     <Canvas camera = {{position: [0,0,5], fov:60}} >
      
      <TestTorus />
     </Canvas>
    </div>
  );
}

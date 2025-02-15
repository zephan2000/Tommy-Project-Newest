import { Warehouse } from "./Warehouse"; 
import { Fan } from "./Fan"; 

import * as THREE from "three";
import { Torus, Environment } from "@react-three/drei";
import {Canvas, ThreeElements, useFrame, useThree} from "@react-three/fiber"
import { TorusGeometry } from "three";
import { useRef, useEffect } from "react";
import React from "react";

function ModelSpin(props) {
    const ModelRef = useRef();
  
    useFrame(() => {
      if (ModelRef.current) {
        ModelRef.current.rotation.y += 0.005;
      }
    });
  
    return <Warehouse ref={ModelRef} {...props} />;
  }
  


export function SceneProps(props) {
    return (
        <div className="fixed inset-0">
         <Canvas camera = {{position: [0,0,5], fov:60}} >
            <directionalLight intensity ={2} position={[1,2,3]}/>
          <ModelSpin />
         </Canvas>
        </div>
      );
}
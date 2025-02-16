// Warehouse.tsx
import React, { forwardRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useLoader } from "@react-three/fiber"; // <-- Import useLoader from @react-three/fiber
import { TextureLoader } from "three"

export const Warehouse = forwardRef(function Warehouse(props, ref) {
  const { nodes, materials } = useGLTF('/assets/Warehouse.glb')
  // Load textures for each material
  const textureMat = useLoader(TextureLoader, "/assets/WarehouseWindowBig.jpg");
  const textureMat1 = useLoader(TextureLoader, "/assets/WarehouseDirtyMetal.jpg");
  const textureMat2 = useLoader(TextureLoader, "/assets/WarehouseDoor.jpg");
  const textureMat3 = useLoader(TextureLoader, "/assets/WarehouseMetalPanel.png");
  const textureMat4 = useLoader(TextureLoader, "/assets/WarehouseGlass.jpg");

  // Assign the textures to the materials (if they exist)
  if (materials.Mat) {
    materials.Mat.map = textureMat;
    materials.Mat.needsUpdate = true;
  }
  if (materials["Mat.1"]) {
    materials["Mat.1"].map = textureMat1;
    materials["Mat.1"].needsUpdate = true;
  }
  if (materials["Mat.002"]) {
    materials["Mat.002"].map = textureMat2;
    materials["Mat.002"].needsUpdate = true;
  }
  if (materials["Mat.003"]) {
    materials["Mat.003"].map = textureMat3;
    materials["Mat.003"].needsUpdate = true;
  }
  if (materials["Mat.004"]) {
    materials["Mat.004"].map = textureMat4;
    materials["Mat.004"].needsUpdate = true;
  }
  return (
    <group {...props} dispose={null}>
       <group
        ref={ref}
        position={[0.052, 2.953, 0.02]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.01}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh001.geometry}
          material={materials['Mat.1']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh001_1.geometry}
          material={materials['Mat.002']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh001_2.geometry}
          material={materials['Mat.003']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh001_3.geometry}
          material={materials['Mat.004']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Mesh001_4.geometry}
          material={materials['Mat.005']}
        />
      </group>
    </group>
  )
})

useGLTF.preload('/assets/Warehouse.glb')
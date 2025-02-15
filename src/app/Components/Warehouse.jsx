// Warehouse.tsx
import React, { forwardRef } from 'react'
import { useGLTF } from '@react-three/drei'

export const Warehouse = forwardRef((props, ref) => {
  const { nodes, materials } = useGLTF('/assets/Warehouse.glb')

  return (
    <group ref={ref} {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.ware_house.geometry}
        material={materials.Mat_4}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.002, 0.002, 0.002]}
      />
    </group>
  )
})

useGLTF.preload('/assets/Warehouse.glb')

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Fan(props) {
  const { nodes, materials } = useGLTF('/assets/fan.glb')
  return (
    <group {...props} dispose={null}>
      <group
        position={[0.115, 1.009, 0.438]}
        rotation={[-0.01, 1.567, 0.01]}
        scale={[0.024, 0.089, 0.007]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube006.geometry}
          material={materials['Material.007']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube006_1.geometry}
          material={materials['Material.003']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube006_2.geometry}
          material={materials['Material.001']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube006_3.geometry}
          material={materials['Material.002']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube006_4.geometry}
          material={materials['Material.004']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube006_5.geometry}
          material={materials['Material.005']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube006_6.geometry}
          material={materials['Material.006']}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/assets/fan.glb')
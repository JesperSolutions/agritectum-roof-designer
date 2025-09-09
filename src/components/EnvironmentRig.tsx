import React from 'react'
import { Environment, Sky, ContactShadows } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface EnvironmentRigProps {
  quality?: 'draft' | 'high'
}

export function EnvironmentRig({ quality = 'high' }: EnvironmentRigProps) {
  const { scene, gl } = useThree()

  // Set up ACES tone mapping and physical camera
  React.useEffect(() => {
    // Note: These properties may not exist on all Three.js versions
    // @ts-ignore
    scene.toneMapping = THREE.ACESFilmicToneMapping
    // @ts-ignore
    scene.toneMappingExposure = 1.0
    
    // Configure renderer for better quality
    gl.shadowMap.enabled = true
    gl.shadowMap.type = quality === 'high' ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap
    gl.outputColorSpace = THREE.SRGBColorSpace
    // @ts-ignore
    gl.antialias = true
    
    // Configure shadow map settings
    gl.shadowMap.autoUpdate = true
  }, [scene, gl, quality])

  const shadowMapSize = quality === 'high' ? 4096 : 1024

  return (
    <>
      {/* HDRI Environment with PMREM */}
      <Environment
        preset="sunset"
        background={true}
        environmentIntensity={0.6}
        environmentRotation={[0, 0, 0]}
      />
      
      {/* Sky for outdoor lighting */}
      <Sky
        distance={450000}
        sunPosition={[0.5, 0.8, 0.5]}
        inclination={0.6}
        azimuth={0.25}
        turbidity={8}
        rayleigh={2}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      
      {/* Contact shadows for grounding */}
      <ContactShadows
        position={[0, -0.1, 0]}
        opacity={0.4}
        scale={15}
        blur={2}
        far={6}
        resolution={quality === 'high' ? 1024 : 512}
      />
      
      {/* Main sun light with soft shadows */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={2.0}
        castShadow
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />
      
      {/* Fill light for better illumination */}
      <directionalLight
        position={[-3, 4, -3]}
        intensity={0.5}
        color="#87CEEB"
      />
      
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.3} color="#87CEEB" />
      
      {/* Rim light for better definition */}
      <directionalLight
        position={[-5, 2, -5]}
        intensity={0.8}
        color="#FFE4B5"
      />
    </>
  )
}

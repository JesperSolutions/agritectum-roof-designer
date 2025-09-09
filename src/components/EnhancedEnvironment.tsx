import { useEffect } from 'react'
import { Environment, Sky, ContactShadows, AccumulativeShadows, RandomizedLight } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface EnhancedEnvironmentProps {
  quality?: 'draft' | 'high'
  lightingStyle?: 'realistic' | 'dramatic' | 'soft' | 'studio'
  enableAccumulativeShadows?: boolean
}

export function EnhancedEnvironment({ 
  quality = 'high', 
  lightingStyle = 'realistic',
  enableAccumulativeShadows = true
}: EnhancedEnvironmentProps) {
  const { scene, gl } = useThree()

  // Set up ACES tone mapping and physical camera
  useEffect(() => {
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
    gl.shadowMap.autoUpdate = true
  }, [scene, gl, quality])

  const shadowMapSize = quality === 'high' ? 4096 : 1024

  // Lighting configurations based on style
  const lightingConfigs = {
    realistic: {
      sunPosition: [5, 8, 5],
      sunIntensity: 2.0,
      sunColor: '#FFE4B5',
      ambientIntensity: 0.3,
      ambientColor: '#87CEEB',
      fillIntensity: 0.5,
      fillColor: '#87CEEB'
    },
    dramatic: {
      sunPosition: [10, 15, 5],
      sunIntensity: 3.0,
      sunColor: '#FF6B35',
      ambientIntensity: 0.1,
      ambientColor: '#2C2C2C',
      fillIntensity: 0.2,
      fillColor: '#4A4A4A'
    },
    soft: {
      sunPosition: [3, 6, 3],
      sunIntensity: 1.5,
      sunColor: '#FFF8DC',
      ambientIntensity: 0.5,
      ambientColor: '#F0F8FF',
      fillIntensity: 0.8,
      fillColor: '#E6F3FF'
    },
    studio: {
      sunPosition: [8, 10, 8],
      sunIntensity: 2.5,
      sunColor: '#FFFFFF',
      ambientIntensity: 0.4,
      ambientColor: '#FFFFFF',
      fillIntensity: 0.6,
      fillColor: '#F5F5F5'
    }
  }

  const config = lightingConfigs[lightingStyle]

  return (
    <>
      {/* HDRI Environment */}
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
      
      {/* Main sun light */}
      <directionalLight
        position={config.sunPosition as [number, number, number]}
        intensity={config.sunIntensity}
        color={config.sunColor}
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
      
      {/* Fill lights for better illumination */}
      <directionalLight
        position={[-3, 4, -3]}
        intensity={config.fillIntensity}
        color={config.fillColor}
      />
      
      <directionalLight
        position={[3, 4, 3]}
        intensity={config.fillIntensity * 0.5}
        color={config.fillColor}
      />
      
      {/* Ambient light */}
      <ambientLight intensity={config.ambientIntensity} color={config.ambientColor} />
      
      {/* Rim light for better definition */}
      <directionalLight
        position={[-5, 2, -5]}
        intensity={0.8}
        color="#FFE4B5"
      />
      
      {/* Enhanced shadows */}
      {enableAccumulativeShadows && quality === 'high' ? (
        <AccumulativeShadows
          frames={100}
          alphaTest={0.85}
          opacity={0.75}
          scale={30}
          position={[0, -1.5, 0]}
        >
          <RandomizedLight
            amount={8}
            radius={2.5}
            ambient={0.5}
            intensity={1}
            position={config.sunPosition as [number, number, number]}
            bias={0.001}
          />
        </AccumulativeShadows>
      ) : (
        <ContactShadows
          position={[0, -0.1, 0]}
          opacity={0.4}
          scale={15}
          blur={2}
          far={6}
          resolution={quality === 'high' ? 1024 : 512}
        />
      )}
    </>
  )
}

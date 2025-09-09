import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface AnimatedCameraProps {
  preset: 'street' | 'isometric' | 'front' | 'top'
  animationSpeed?: number
  enableAnimation?: boolean
}

export function AnimatedCamera({ 
  preset, 
  animationSpeed = 1.0, 
  enableAnimation = true 
}: AnimatedCameraProps) {
  const { camera } = useThree()
  const animationRef = useRef<{
    startPosition: THREE.Vector3
    startTarget: THREE.Vector3
    targetPosition: THREE.Vector3
    targetTarget: THREE.Vector3
    progress: number
    duration: number
  } | null>(null)

  // Camera presets with smooth transitions
  const cameraPresets = {
    street: {
      position: new THREE.Vector3(8, 2, 8),
      target: new THREE.Vector3(0, 1, 0)
    },
    isometric: {
      position: new THREE.Vector3(6, 6, 6),
      target: new THREE.Vector3(0, 0, 0)
    },
    front: {
      position: new THREE.Vector3(0, 3, 8),
      target: new THREE.Vector3(0, 2, 0)
    },
    top: {
      position: new THREE.Vector3(0, 10, 0),
      target: new THREE.Vector3(0, 0, 0)
    }
  }

  // Start camera animation when preset changes
  useEffect(() => {
    if (!enableAnimation) return

    const presetData = cameraPresets[preset]
    const currentPosition = new THREE.Vector3().copy(camera.position)
    const currentTarget = new THREE.Vector3()
    camera.getWorldDirection(currentTarget)
    currentTarget.multiplyScalar(-10).add(currentPosition)

    animationRef.current = {
      startPosition: currentPosition.clone(),
      startTarget: currentTarget.clone(),
      targetPosition: presetData.position.clone(),
      targetTarget: presetData.target.clone(),
      progress: 0,
      duration: 1.0 / animationSpeed
    }
  }, [preset, enableAnimation, camera])

  // Animate camera
  useFrame((_state, delta) => {
    if (!animationRef.current || !enableAnimation) return

    const anim = animationRef.current
    anim.progress += delta / anim.duration

    if (anim.progress >= 1) {
      // Animation complete
      camera.position.copy(anim.targetPosition)
      camera.lookAt(anim.targetTarget)
      camera.updateProjectionMatrix()
      animationRef.current = null
      return
    }

    // Smooth interpolation using easing function
    const easeProgress = THREE.MathUtils.smoothstep(anim.progress, 0, 1)
    
    // Interpolate position
    const currentPosition = new THREE.Vector3().lerpVectors(
      anim.startPosition,
      anim.targetPosition,
      easeProgress
    )
    
    // Interpolate target
    const currentTarget = new THREE.Vector3().lerpVectors(
      anim.startTarget,
      anim.targetTarget,
      easeProgress
    )

    // Apply to camera
    camera.position.copy(currentPosition)
    camera.lookAt(currentTarget)
    camera.updateProjectionMatrix()
  })

  return null
}

// Camera path animation inspired by the scroll example
export function PathAnimatedCamera({ 
  pathType = 'orbit',
  speed = 1.0,
  enablePath = false 
}: {
  pathType?: 'orbit' | 'figure8' | 'spiral'
  speed?: number
  enablePath?: boolean
}) {
  const { camera } = useThree()
  const timeRef = useRef(0)

  useFrame((_state, delta) => {
    if (!enablePath) return

    timeRef.current += delta * speed

    switch (pathType) {
      case 'orbit':
        camera.position.set(
          Math.sin(timeRef.current) * 10,
          5,
          Math.cos(timeRef.current) * 10
        )
        camera.lookAt(0, 0, 0)
        break

      case 'figure8':
        camera.position.set(
          Math.sin(timeRef.current) * 8,
          5 + Math.sin(timeRef.current * 2) * 2,
          Math.cos(timeRef.current * 0.5) * 8
        )
        camera.lookAt(0, 0, 0)
        break

      case 'spiral':
        camera.position.set(
          Math.sin(timeRef.current) * (5 + timeRef.current * 0.5),
          5 + timeRef.current * 0.2,
          Math.cos(timeRef.current) * (5 + timeRef.current * 0.5)
        )
        camera.lookAt(0, 0, 0)
        break
    }

    camera.updateProjectionMatrix()
  })

  return null
}

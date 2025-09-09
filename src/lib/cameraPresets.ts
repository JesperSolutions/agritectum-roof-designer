import { Vector3 } from 'three'

export interface CameraPreset {
  position: Vector3
  target: Vector3
  name: string
  description: string
}

export const cameraPresets: Record<string, CameraPreset> = {
  street: {
    position: new Vector3(8, 2, 8),
    target: new Vector3(0, 1, 0),
    name: 'Street View',
    description: 'Ground-level perspective'
  },
  isometric: {
    position: new Vector3(6, 6, 6),
    target: new Vector3(0, 0, 0),
    name: 'Isometric View',
    description: '45-degree aerial angle'
  },
  front: {
    position: new Vector3(0, 3, 8),
    target: new Vector3(0, 2, 0),
    name: 'Front View',
    description: 'Direct frontal perspective'
  },
  top: {
    position: new Vector3(0, 10, 0),
    target: new Vector3(0, 0, 0),
    name: 'Top View',
    description: 'Bird\'s eye perspective'
  }
}

export const applyCameraPreset = (camera: any, preset: CameraPreset) => {
  camera.position.copy(preset.position)
  camera.lookAt(preset.target)
  camera.updateProjectionMatrix()
}


import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { BuildingBody } from './BuildingBody'
import { RoofGenerator } from './RoofGenerator'
import { EnvironmentRig } from './EnvironmentRig'
import { SceneController } from './SceneController'
import { RoofParams } from '../lib/roof/geometry'

interface CanvasRootProps {
  roofParams: RoofParams
  quality?: 'draft' | 'high'
  onExportScreenshot?: () => void
}

export function CanvasRoot({ roofParams, quality = 'high', onExportScreenshot }: CanvasRootProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 5, 5]} />
      
      <EnvironmentRig quality={quality} />
      
      <BuildingBody quality={quality} />
      
      <RoofGenerator params={roofParams} quality={quality} />
      
      <SceneController 
        onExportScreenshot={onExportScreenshot} 
        quality={quality}
        roofParams={roofParams}
      />
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        dampingFactor={0.05}
        enableDamping={true}
        minDistance={3}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  )
}

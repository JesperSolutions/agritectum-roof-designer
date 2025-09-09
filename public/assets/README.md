# Assets Directory

This directory contains 3D assets for the Agritectum Roof Designer.

## Required Files

### Building Model
- `building.glb` - Main building model with baked textures
- `building.gltf` - Alternative glTF format (if using separate textures)

### Textures
Place all texture files in the `textures/` subdirectory:
- `building_diffuse.jpg` - Base color texture
- `building_normal.jpg` - Normal map for surface detail
- `building_roughness.jpg` - Roughness map
- `building_ao.jpg` - Ambient occlusion map
- `building_lightmap.jpg` - Baked lighting information

## Asset Creation Guidelines

### Blender Workflow
1. Model your building with proper UV unwrapping
2. Create materials with PBR textures
3. Bake lighting using Cycles renderer
4. Export as glTF 2.0 with embedded textures

### Unreal Engine Workflow
1. Import building model
2. Create materials with baked lighting
3. Export using Datasmith or glTF exporter
4. Ensure all textures are properly embedded

## Performance Notes
- Keep texture resolutions reasonable (1024x1024 or 2048x2048 max)
- Use compressed formats (JPEG for diffuse, PNG for normal maps)
- Optimize geometry for web (LOD if needed)
- Test loading times on slower connections

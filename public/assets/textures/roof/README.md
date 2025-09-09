# Roof Textures

This directory contains PBR texture maps for roof materials.

## Required Files

### Primary Format (KTX2 - Recommended)
- `diffuse.ktx2` - Base color texture
- `normal.ktx2` - Normal map for surface detail
- `roughness.ktx2` - Roughness variation map
- `ao.ktx2` - Ambient occlusion map

### Fallback Format (PNG/JPG)
- `diffuse.jpg` - Base color texture (1024x1024)
- `normal.jpg` - Normal map (1024x1024)
- `roughness.jpg` - Roughness map (1024x1024)
- `ao.jpg` - Ambient occlusion map (1024x1024)

## Texture Creation Guidelines

### Diffuse Map
- Base color information only (no lighting)
- Use realistic material colors
- Ensure good UV unwrapping
- Resolution: 1024x1024 or 2048x2048

### Normal Map
- Surface detail and bumps
- Blue channel pointing up
- Generated from height maps or sculpted details
- Resolution: 1024x1024 or 2048x2048

### Roughness Map
- Black = smooth (0.0)
- White = rough (1.0)
- Gray values for variation
- Resolution: 1024x1024 or 2048x2048

### Ambient Occlusion Map
- Black = shadowed areas
- White = fully lit areas
- Gray values for soft shadows
- Resolution: 1024x1024 or 2048x2048

## Compression

Use KTX2 format for better compression and performance:
```bash
# Install ktx2-basisu
npm install -g ktx2-basisu

# Convert textures
ktx2-basisu diffuse.jpg --format UASTC --quality 100
ktx2-basisu normal.jpg --format UASTC --quality 100
ktx2-basisu roughness.jpg --format UASTC --quality 100
ktx2-basisu ao.jpg --format UASTC --quality 100
```

## Performance Notes

- KTX2 format: ~70% smaller than PNG
- Better GPU compression
- Faster loading times
- Fallback to PNG/JPG for compatibility


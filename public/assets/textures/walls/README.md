# Wall Textures

This directory contains PBR texture maps for wall materials.

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

## Material Types

### Brick Walls
- Reddish-brown base color
- High roughness variation
- Strong normal map detail
- Good AO for mortar lines

### Stucco Walls
- Light, neutral base color
- Medium roughness
- Subtle normal map
- Soft AO variation

### Wood Siding
- Natural wood grain colors
- Medium-high roughness
- Strong normal map for grain
- Good AO for board gaps

## Texture Creation Guidelines

Follow the same guidelines as roof textures, but consider:
- Wall materials are typically more uniform
- Focus on surface texture rather than major geometry
- Consider tiling for larger surfaces
- Use appropriate color palettes for building materials


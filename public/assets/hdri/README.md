# HDRI Environment Maps

This directory contains HDRI environment maps for realistic lighting and reflections.

## Required Files

- `venice_sunset_2k.hdr` - Main environment map (2K resolution)
- `venice_sunset_4k.hdr` - High quality version (4K resolution)

## Asset Sources

Download from PolyHaven (free, CC0 license):
- https://polyhaven.com/a/venice_sunset

## Usage

The Environment component will automatically load the appropriate resolution based on quality settings:
- Draft mode: 2K resolution
- High mode: 2K resolution (can be upgraded to 4K)

## Performance Notes

- 2K HDRI: ~8MB download, good for most use cases
- 4K HDRI: ~32MB download, use only for high-end presentations
- Consider using compressed formats for production


# Agritectum Roof Designer

A browser-native photorealistic roof visualization demo built with React, TypeScript, Vite, and Three.js. Features game-quality rendering with PBR materials, HDRI lighting, and real-time material switching.

## ✨ Features

- 🏭 **Industrial Flat Roof Design** - Focused on industrial and commercial building roofs
- 🗺️ **Maps Integration** - Find your building on a map and auto-generate roof designs
- 🎨 **Realistic Material Colorways** - 8 different roof materials with proper PBR properties
- 📸 **High-Quality Screenshot Export** - 2x resolution export with quality settings
- 📷 **Multiple Camera Presets** - Street, Isometric, Front, and Top views
- 🌅 **HDRI Environment Lighting** - Realistic reflections and global illumination
- ⚡ **Performance Optimization** - Draft/High quality modes for 60+ FPS
- 🎮 **Smooth Controls** - OrbitControls with damping and soft shadows
- 🔧 **Asset Pipeline Ready** - KTX2 texture compression and glTF 2.0 support
- 🌍 **OpenStreetMap Integration** - Real building footprint data for accurate roof generation

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **3D Rendering**: Three.js + React Three Fiber
- **3D Utilities**: @react-three/drei
- **Styling**: CSS-in-JS

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd agritectum-roof-designer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── CanvasRoot.tsx      # Main 3D scene setup
│   ├── Building.tsx        # glTF loader with PBR materials
│   ├── EnvironmentRig.tsx  # HDRI lighting and soft shadows
│   ├── ControlsPanel.tsx   # Enhanced UI with quality toggle
│   └── SceneController.tsx # Camera controls and export
├── lib/
│   ├── materials.ts        # PBR material system and colorways
│   └── cameraPresets.ts    # Camera position presets
├── App.tsx                 # Main application with state management
├── main.tsx               # Application entry point
└── index.css              # Global styles

public/
└── assets/
    ├── building.glb        # Main building model (glTF 2.0)
    ├── hdri/
    │   └── venice_sunset_2k.hdr  # HDRI environment map
    └── textures/
        ├── roof/           # Roof PBR textures (KTX2 + fallback)
        └── walls/          # Wall PBR textures (KTX2 + fallback)
```

## Usage

### Maps Integration

The application now includes a powerful maps integration feature that allows users to:

1. **Find Your Building**: Click the "🗺️ Find Building" button in the design tools panel
2. **Search by Address**: Enter your building's address or coordinates
3. **Select Building**: Choose from the list of found buildings with real footprint data
4. **Auto-Generate Roof**: The system automatically creates a roof design based on your building's actual dimensions and shape

The maps integration uses OpenStreetMap data to provide accurate building footprints, dimensions, and roof type information.

### Controls

- **Mouse/Touch**: Drag to rotate the view
- **Scroll/Pinch**: Zoom in and out
- **Right-click + Drag**: Pan the camera
- **UI Controls**: Use the panel on the left to change roof colors and camera views

### Roof Color Customization

Click any of the color buttons in the UI panel to instantly change the roof material color. The demo includes several preset colors:

- Brown (default)
- Red
- Blue
- Green
- Gray
- Black

### Camera Views

- **Street View**: Lower angle, closer to ground level
- **Isometric View**: 45-degree angle from above

### Exporting Screenshots

Click the "Export Screenshot" button to download the current view as a PNG file.

## Asset Pipeline

### Adding Custom Building Models

1. Create your building model in Blender or Unreal Engine
2. Apply baked textures for realistic lighting
3. Export as glTF 2.0 format
4. Place the `.glb` file in `public/assets/`
5. Update the `Building.tsx` component to load your model

### Texture Requirements

For photorealistic results, include these texture maps:

- **Diffuse/Albedo**: Base color information
- **Normal**: Surface detail and bumps
- **Roughness**: Surface roughness variation
- **Ambient Occlusion**: Shadowed areas and crevices
- **Lightmap**: Baked lighting information

## Performance Optimization

- Uses Three.js with optimized settings
- Implements proper shadow mapping
- ACES tone mapping for realistic color grading
- Efficient material management
- Responsive design for various screen sizes

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

The project uses ESLint with TypeScript rules. Run `npm run lint` to check for issues.

## Current Status

The application is **fully functional** with procedural geometry and PBR materials. It demonstrates all the core features:

- ✅ **Working 3D house** with realistic materials
- ✅ **Material colorways** (8 different roof materials)
- ✅ **Quality toggle** (Draft/High modes)
- ✅ **Camera presets** (4 different views)
- ✅ **Screenshot export** with quality scaling
- ✅ **HDRI lighting** with soft shadows

## Next Steps for Production

1. **Add your glTF model** to `/public/assets/building.glb`
2. **Add HDRI file** to `/public/assets/hdri/venice_sunset_2k.hdr`
3. **Add texture maps** to `/public/assets/textures/roof/` and `/walls/`
4. **Convert to KTX2** for optimal performance (optional)

The application will automatically detect and use your assets when you add them!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Three.js community for excellent 3D web graphics
- React Three Fiber for React integration
- @react-three/drei for useful utilities
- Vite for fast development experience

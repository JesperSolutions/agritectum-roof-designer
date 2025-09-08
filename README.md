# Agritectum Roof Designer

A comprehensive web application for designing sustainable roof layouts with instant performance metrics and AI-powered optimization.

## Features

### Phase 0 (MVP) - ✅ Implemented
- **Quick Planner**: Preset splits for CO₂, Energy, and Biodiversity focused layouts
- **Live KPIs**: Real-time calculation of energy production, water retention, CO₂ impact, costs, and payback
- **Interactive Canvas**: Drag-and-drop zone blocks with visual feedback
- **Performance Metrics**: Instant feedback on layout performance

### Phase 1 (Coming Soon)
- **Sketch Lite**: Advanced canvas with snap grid and constraint validation
- **AI Suggestions**: Heuristic layout generator based on roof geometry and priorities
- **Constraint Validation**: Real-time checking of setbacks, maintenance lanes, and structural limits

### Phase 2 (Future)
- **Layout Optimization**: Constrained search algorithms to improve KPIs
- **Sharing & Collaboration**: Public share links and version comparison
- **Advanced Analytics**: Historical performance tracking and insights

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Konva** for 2D canvas interactions
- **Recharts** for data visualization
- **Framer Motion** for animations

### Backend (Planned)
- **Firebase** for authentication and database
- **Cloud Functions** for KPI calculations and optimization
- **Firestore** for data persistence

### AI/Optimization (Planned)
- **Heuristic algorithms** for layout suggestions
- **Constrained optimization** for layout improvement
- **Machine learning** for layout ranking (Phase 3)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agritectum-roof-designer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## Usage

### Quick Start
1. Select a preset layout (CO₂, Energy, or Biodiversity focused)
2. View instant KPI calculations
3. Drag zone blocks to adjust layout
4. Export PDF report (coming soon)

### Zone Types
- **Green**: Living roofs for biodiversity and CO₂ sequestration
- **Solar**: Photovoltaic panels for energy generation
- **Water**: Retention systems for stormwater management
- **Social**: Accessible spaces for community use

### KPI Calculations
- **Energy Production**: Based on solar irradiance, panel efficiency, and system losses
- **Water Retention**: Calculated from green/water areas and regional rainfall
- **CO₂ Impact**: Combines solar grid substitution and green roof sequestration
- **Cost Analysis**: CAPEX estimation and payback period calculation

## Architecture

### Data Models
```typescript
// Core types for roof design
type ZoneType = 'GREEN' | 'SOLAR' | 'WATER' | 'SOCIAL';

interface Layout {
  id: string;
  roofId: string;
  blocks: ZoneBlock[];
  kpis: KpiSnapshot;
  // ... other fields
}
```

### State Management
- **Zustand store** for application state
- **Real-time KPI calculation** on layout changes
- **Optimistic updates** for smooth user experience

### Performance Optimization
- **Memoized calculations** for expensive operations
- **Debounced updates** for real-time interactions
- **Lazy loading** for non-critical components

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── Canvas2D.tsx    # Interactive roof canvas
│   ├── KpiPanel.tsx    # Performance metrics display
│   └── ...
├── lib/                # Utilities and services
│   ├── kpi-engine.ts   # KPI calculation logic
│   ├── firebase.ts     # Firebase configuration
│   └── utils.ts        # Helper functions
├── store/              # State management
│   └── planner-store.ts # Main application store
├── types/              # TypeScript definitions
│   └── index.ts        # Core type definitions
└── ...
```

### Key Components
- **RoofPlanner**: Main application container
- **PresetPicker**: Quick start layout selection
- **Canvas2D**: Interactive roof design canvas
- **KpiPanel**: Real-time performance metrics
- **Actions**: Layout operations and export

### Development Guidelines
- **TypeScript first**: All code uses strict TypeScript
- **Component composition**: Small, focused, reusable components
- **Performance conscious**: Optimized for real-time interactions
- **Accessibility**: WCAG 2.1 AA compliance target

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Roadmap

### Phase 1 (Q1 2025)
- [ ] Advanced canvas with snap grid
- [ ] Constraint validation system
- [ ] AI layout suggestions
- [ ] Firebase integration

### Phase 2 (Q2 2025)
- [ ] Layout optimization algorithms
- [ ] Sharing and collaboration features
- [ ] Advanced analytics dashboard
- [ ] Mobile PWA optimization

### Phase 3 (Q3 2025)
- [ ] Machine learning integration
- [ ] Computer vision for footprint detection
- [ ] Multi-tenant enterprise features
- [ ] API for third-party integrations

## Support

For questions, issues, or feature requests, please open an issue on GitHub or contact the development team.
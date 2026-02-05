# WayFinder Kenya - Smart Road Alert System

A mobile-first navigation app that alerts drivers of murram roads, construction zones, and road hazards in Kenya.

## Features

- 🚧 **Real-time Road Alerts**: Get notified of murram roads, construction zones, potholes, and flooded sections
- 📍 **GPS-based Proximity Alerts**: Automatic warnings when approaching road hazards (within 500m)
- 🗺️ **Interactive Map**: View all reported conditions on an intuitive Leaflet-based map
- 📱 **Mobile-First Design**: Optimized for use while driving or stopped briefly
- 🌍 **Offline Support**: Download maps for offline navigation
- 🗣️ **Voice Navigation**: English and Swahili language support

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Vercel will auto-detect the Vite framework
3. Deploy with zero configuration

Or use the CLI:
```bash
npm i -g vercel
vercel --prod
```

### Netlify

1. Connect your GitHub repository to Netlify
2. Build settings are auto-configured via `netlify.toml`
3. Deploy automatically on push

Or use the CLI:
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### Manual Deployment

```bash
npm run build
# Upload the `dist` folder to any static hosting service
```

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Maps**: Leaflet + React-Leaflet
- **Animations**: Framer Motion
- **State Management**: React Context + TanStack Query

## Project Structure

```
src/
├── components/
│   ├── navigation/     # Map and navigation components
│   └── ui/             # Reusable UI components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utilities (validation, rate limiting)
└── pages/              # Page components
```

## Environment Variables

No environment variables required for the basic app. The app runs without manual configuration.

## License

MIT

# GroupDrop

A React-based interactive application that simulates proximity-based group formation between mobile devices. Users can drag phones around a desktop interface, and when phones come within close proximity, they can form groups through an intuitive confirmation system.

## Features

- **Interactive Phone Simulation**: Drag and interact with multiple phone devices on a desktop canvas
- **Proximity Detection**: Automatic detection when phones are within 8.5cm of each other
- **Group Formation**: Create and manage groups through a swipe-to-confirm interface
- **Group History**: View and manage previously confirmed groups
- **Representative Groups**: Link new groups to existing confirmed groups
- **Physics-Based Interactions**: Smooth animations and realistic movement using physics simulation

## Tech Stack

- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **Vite 6.4.1** - Build tool and dev server
- **TailwindCSS 4.0** - Styling
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form management
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd GroupDrop
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will open automatically in your browser at `http://localhost:3000`.

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
GroupDrop/
├── src/
│   ├── components/        # React components
│   │   ├── DraggablePhone.tsx
│   │   ├── PhoneWithProximity.tsx
│   │   ├── GroupScreen.tsx
│   │   └── GroupsHistory.tsx
│   ├── imports/          # Imported components
│   ├── assets/           # Images and static assets
│   ├── styles/           # Global styles
│   ├── utils/            # Utility functions
│   └── App.tsx           # Main application component
├── index.html            # HTML entry point
├── vite.config.ts        # Vite configuration
└── package.json          # Dependencies and scripts
```

## Development

The project uses Vite with React SWC plugin for fast development and hot module replacement. Changes to source files will automatically reload in the browser.

## License

Private project - All rights reserved.

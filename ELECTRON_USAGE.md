# Electron Desktop App Usage Guide

This guide explains how to use the Seat Defect Tracking system as a desktop application.

## Quick Start

### For Developers

1. **Development Mode** (recommended for development):
   ```bash
   npm run electron-dev
   ```
   This starts the frontend, backend, and Electron app together with hot-reload.

2. **Manual Development** (if you need more control):
   ```bash
   # Terminal 1: Start backend
   cd backend && npm run dev

   # Terminal 2: Start frontend  
   cd frontend && npm start

   # Terminal 3: Start Electron (after servers are running)
   npm run electron
   ```

### For Distribution

1. **Build for current platform**:
   ```bash
   npm run dist
   ```

2. **Build for specific platforms**:
   ```bash
   npm run dist-win     # Windows (.exe installer)
   npm run dist-mac     # macOS (.dmg package)
   npm run dist-linux   # Linux (AppImage)
   npm run dist-all     # All platforms (requires setup)
   ```

## Desktop Application Features

### What Changes in Desktop Mode

**Data Storage:**
- Database and uploads are stored in user's application data directory
- No need for manual database setup - automatically initialized on first run
- Cross-platform file paths handled automatically

**Network:**
- Backend runs on a dynamically allocated port (starting from 3001)
- No conflicts with other local services
- Automatic port detection and allocation

**User Experience:**
- Native desktop window with proper window controls
- Application menus with keyboard shortcuts
- Desktop integration (taskbar, dock, system tray)
- Auto-updater support in production builds

### Application Menus

**File Menu:**
- `New Project` (Ctrl+N / Cmd+N) - Navigate to create new project
- `Exit` (Ctrl+Q / Cmd+Q) - Close application

**View Menu:**
- `Reload` (Ctrl+R / Cmd+R) - Reload the application
- `Toggle Developer Tools` (F12) - Open debugging tools
- `Zoom In/Out` - Adjust application zoom
- `Toggle Fullscreen` (F11)

**Window Menu:**
- `Minimize` - Minimize window
- `Close` - Close window

**Help Menu:**
- `About` - Show application information

## Data Locations

The desktop app stores data in standard OS locations:

### Windows
```
%APPDATA%\Seat Defect Tracking\
├── database.sqlite        # Main database
├── uploads/              # Image uploads
│   ├── defects/         # Defect photos
│   └── reference-images/ # Reference images
└── logs/                # Application logs
```

### macOS
```
~/Library/Application Support/Seat Defect Tracking/
├── database.sqlite
├── uploads/
│   ├── defects/
│   └── reference-images/
└── logs/
```

### Linux
```
~/.config/Seat Defect Tracking/
├── database.sqlite
├── uploads/
│   ├── defects/
│   └── reference-images/
└── logs/
```

## Installation Instructions

### For End Users

1. **Download** the appropriate installer from releases:
   - Windows: `Seat-Defect-Tracking-Setup-x.x.x.exe`
   - macOS: `Seat-Defect-Tracking-x.x.x.dmg`
   - Linux: `Seat-Defect-Tracking-x.x.x.AppImage`

2. **Install**:
   - **Windows**: Run the `.exe` installer and follow the setup wizard
   - **macOS**: Open the `.dmg` file and drag the app to Applications folder
   - **Linux**: Make the `.AppImage` executable and run it

3. **Launch** the application from:
   - **Windows**: Start Menu or Desktop shortcut
   - **macOS**: Applications folder or Launchpad
   - **Linux**: Application menu or run the AppImage directly

### First Launch

On first launch, the application will:
1. Create necessary data directories
2. Initialize the database with required tables
3. Set up the file upload directories
4. Show the project selection screen

## Development Workflow

### Setting Up Development Environment

1. **Clone and Install**:
   ```bash
   git clone <repository>
   cd seat-defect-tracking
   npm install
   ```

2. **Start Development**:
   ```bash
   npm run electron-dev
   ```
   This will:
   - Start the React development server (port 3000)
   - Start the Express backend (port 4001)
   - Launch Electron after both are ready

### Making Changes

**Frontend Changes:**
- Edit files in `frontend/src/`
- Hot reload works automatically in development mode
- Changes appear immediately in the Electron window

**Backend Changes:**
- Edit files in `backend/src/`
- Nodemon will restart the backend automatically
- Electron will reconnect to the restarted backend

**Electron Changes:**
- Edit `main.js` or `preload.js`
- Restart the Electron process (Ctrl+C and run `npm run electron-dev` again)

### Building for Distribution

1. **Prepare Icons** (optional but recommended):
   ```bash
   # Add icons to assets/ directory
   assets/
   ├── icon.png    # 512x512 PNG (required for Linux)
   ├── icon.ico    # Windows icon (recommended)
   └── icon.icns   # macOS icon (recommended)
   ```

2. **Build**:
   ```bash
   # Build for your current platform
   npm run dist

   # Or build for specific platforms
   npm run dist-win
   npm run dist-mac
   npm run dist-linux
   ```

3. **Find Output**:
   Distribution files will be in the `dist/` directory

## Configuration Options

### Environment Variables

The desktop app respects these environment variables:

- `NODE_ENV` - Set to 'production' for production builds
- `PORT` - Backend port (defaults to 4001, auto-increments if occupied)
- `LOG_LEVEL` - Logging level: 'error', 'warn', 'info', 'debug'

### Electron Builder Configuration

Customize the build in `package.json` under the `build` section:

```json
{
  "build": {
    "appId": "com.yourcompany.seatdefecttracking",
    "productName": "Your Custom Name",
    "directories": {
      "output": "dist"
    }
  }
}
```

## Troubleshooting

### Common Issues

**Port Conflicts:**
- The app automatically finds available ports starting from 3001
- If you see connection errors, check no other apps are using these ports

**Database Issues:**
- Delete the database file to reset (loses all data)
- Location shown above under "Data Locations"
- Restart the app after deletion

**Build Errors:**
```bash
# Clean node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clean frontend build
cd frontend && rm -rf build node_modules
npm install && npm run build
```

**Permission Issues (Linux/macOS):**
```bash
# Make AppImage executable
chmod +x Seat-Defect-Tracking-*.AppImage

# Fix data directory permissions
chmod -R 755 ~/.config/Seat\ Defect\ Tracking/
```

### Development Issues

**Hot Reload Not Working:**
- Ensure you're using `npm run electron-dev`
- Check that the frontend development server is running on port 3000
- Restart the development environment

**Backend Not Starting:**
- Check backend logs in the terminal
- Ensure database migrations can run
- Verify no permission issues with data directory

**Electron Window Issues:**
- Clear Electron cache: `rm -rf ~/Library/Caches/seat-defect-tracking/` (macOS)
- Reset window state by deleting data directory and restarting

## Production Deployment

### Auto-Updates

The app includes auto-updater functionality:
1. Set up a release server or use GitHub Releases
2. Configure update server URL in `main.js`
3. Users will be notified of updates automatically

### Code Signing (Recommended)

For production distribution:

**Windows:** Get a code signing certificate
**macOS:** Use Apple Developer ID
**Linux:** No signing required for AppImage

Add signing configuration to `package.json`:

```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/cert.p12",
      "certificatePassword": "password"
    },
    "mac": {
      "identity": "Developer ID Application: Your Name"
    }
  }
}
```

## Migration from Web Version

### Moving Existing Data

If you have data from the web version:

1. **Database Migration:**
   ```bash
   # Copy your existing SQLite file to the desktop app data directory
   cp /path/to/old/database.sqlite "/path/to/app/data/database.sqlite"
   ```

2. **File Uploads:**
   ```bash
   # Copy uploads directory
   cp -r /path/to/old/uploads "/path/to/app/data/uploads"
   ```

3. **Start the desktop app** - it will detect and use the existing data

### Differences from Web Version

- **No manual server management** - backend starts automatically
- **No browser required** - runs as native desktop app
- **Data persistence** - stored in user's app data, not temporary locations
- **Auto-updates** - users can receive updates automatically
- **Native integration** - desktop notifications, file associations, etc.

## Support

For issues specific to the desktop version:

1. Check the logs in the app data directory
2. Try resetting the database (backup first!)
3. Verify file permissions in the data directory
4. Check for antivirus interference (some flag Node.js apps)

For general application issues, refer to the main README.md file.
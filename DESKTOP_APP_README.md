# Desktop Application Conversion Complete

The seat defect tracking system has been successfully converted into a desktop application using Electron. This document provides information about the desktop version and how to use it.

## What's New

### Desktop Application Features

✅ **Native Desktop Experience**
- Standalone executable that doesn't require a web browser
- Native window controls and operating system integration
- Desktop application menus and keyboard shortcuts
- Auto-updater support for future releases

✅ **Self-Contained Backend**
- Express.js backend runs automatically within the desktop app
- SQLite database stored in user's application data directory
- File uploads managed in user's documents/application data
- No external dependencies required after installation

✅ **Cross-Platform Support**
- Windows (.exe installer)
- macOS (.dmg package)  
- Linux (AppImage)

### Technical Implementation

**Architecture Changes:**
- `main.js` - Electron main process that manages windows and backend server
- `preload.js` - Secure IPC bridge between renderer and main processes
- Backend automatically starts when the application launches
- Database and uploads stored in OS-appropriate user data directories
- Dynamic port allocation to avoid conflicts with other services

## Development Commands

### Development Mode
```bash
# Start development environment (frontend, backend, and Electron)
npm run electron-dev

# Start individual components
npm run electron          # Just Electron (assumes backend running)
cd frontend && npm start   # Frontend development server
cd backend && npm run dev  # Backend development server
```

### Building for Distribution

```bash
# Build for current platform
npm run dist

# Build for specific platforms
npm run dist-win    # Windows
npm run dist-mac    # macOS  
npm run dist-linux  # Linux

# Build for all platforms (requires platform-specific tools)
npm run dist-all
```

### Build Output
Distribution files will be created in the `dist/` directory:
- **Windows**: `.exe` installer and unpacked folder
- **macOS**: `.dmg` disk image and `.app` bundle
- **Linux**: `.AppImage` portable executable

## Installation & Distribution

### For End Users

**Windows:**
1. Download the `.exe` installer
2. Run installer and follow setup wizard
3. Launch from Start Menu or desktop shortcut

**macOS:**
1. Download the `.dmg` file
2. Open and drag application to Applications folder
3. Launch from Applications folder or Launchpad

**Linux:**
1. Download the `.AppImage` file
2. Make executable: `chmod +x SeatDefectTracking-*.AppImage`
3. Run: `./SeatDefectTracking-*.AppImage`

### Data Storage Locations

The desktop application stores data in OS-appropriate locations:

**Windows:** `%APPDATA%\Seat Defect Tracking\`
- Database: `userData\database.sqlite`
- Uploads: `userData\uploads\`
- Logs: `userData\logs\`

**macOS:** `~/Library/Application Support/Seat Defect Tracking/`
- Database: `database.sqlite`
- Uploads: `uploads/`
- Logs: `logs/`

**Linux:** `~/.config/Seat Defect Tracking/`
- Database: `database.sqlite` 
- Uploads: `uploads/`
- Logs: `logs/`

## Application Icons

To customize the application icon, add the following files to the `assets/` directory:

- `icon.png` - 512x512 PNG (Linux)
- `icon.ico` - Windows icon file
- `icon.icns` - macOS icon file

## Auto-Updates

The desktop application includes auto-updater functionality for production builds. Updates will be checked automatically and users will be notified when new versions are available.

## Security Features

- **Context Isolation**: Renderer processes are isolated from Node.js
- **No Remote Module**: Direct access to Node.js from renderer is disabled
- **Secure IPC**: Communication between processes uses secure channels
- **File System Sandboxing**: Files are stored in appropriate user directories

## Troubleshooting

### Common Issues

**Application won't start:**
- Check that required ports (3001+) aren't in use by other applications
- Verify the database file isn't corrupted in userData directory
- Check logs in the userData/logs directory

**Database issues:**
- Delete the database.sqlite file to reset (will lose all data)
- Check that userData directory has write permissions

**Performance issues:**
- The application requires Node.js runtime - some antivirus software may flag this
- Ensure adequate disk space for database and file uploads

### Development Issues

**Build fails:**
- Ensure all dependencies are installed: `npm install`
- Check that both frontend and backend build successfully individually
- Verify icon files exist in assets/ directory (at minimum icon.png)

## Migration from Web Version

If you have existing data from the web version:

1. **Database**: Copy your SQLite database file to the userData directory
2. **Uploads**: Copy upload files to userData/uploads/ directory
3. **Configuration**: No additional configuration needed - the app will detect existing data

## Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder Configuration](https://www.electron.build/configuration/configuration)
- Original web application documentation in README.md
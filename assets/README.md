# Assets Directory

This directory contains application assets for the Electron desktop app.

## Required Files

For proper desktop application distribution, you'll need to provide:

- **icon.png** - 512x512 PNG icon for Linux AppImage
- **icon.ico** - Windows icon file (.ico format)
- **icon.icns** - macOS icon file (.icns format)

## Icon Requirements

### Windows (.ico)
- Size: Multiple sizes embedded (16x16, 32x32, 48x48, 64x64, 128x128, 256x256)
- Format: ICO

### macOS (.icns)  
- Size: Multiple sizes embedded (16x16 to 1024x1024)
- Format: ICNS

### Linux (.png)
- Size: 512x512 pixels
- Format: PNG with transparency

## Creating Icons

You can use tools like:
- Online converters (png to ico/icns)
- ImageMagick
- Icon creation software like IconJar, Image2icon

Place your icon files in this directory before building the desktop application.
#!/bin/bash

# CJSR Matrix Federation Bundle Builder
# Creates downloadable packages for itch.io distribution

echo "🐔 Building CJSR Matrix Federation Bundle..."

# Create bundle directory structure
mkdir -p export-bundle/{windows,mac,linux,web,mobile}
mkdir -p export-bundle/federation-server
mkdir -p export-bundle/assets/icons

# Build frontend
echo "📦 Building frontend..."
npm run build

# Copy built frontend to bundle
cp -r dist/* export-bundle/web/
cp -r dist/* export-bundle/windows/
cp -r dist/* export-bundle/mac/
cp -r dist/* export-bundle/linux/

# Copy Electron configuration
cp bundle-config/electron-main.js export-bundle/
cp bundle-config/preload.js export-bundle/
cp bundle-config/package-electron.json export-bundle/package.json

# Copy standalone server
cp bundle-config/server-standalone.js export-bundle/federation-server/
cp bundle-config/federation-config.json export-bundle/federation-server/

# Create game data exports
echo "📊 Exporting game data..."
node bundle-config/export-game-data.js

# Copy essential assets
cp -r public/audio export-bundle/assets/ 2>/dev/null || echo "No audio assets found"
cp -r attached_assets/*.png export-bundle/assets/icons/ 2>/dev/null || echo "No icon assets found"

# Create README files for each platform
cat > export-bundle/README.md << 'EOF'
# ChickenJockey Scribe Racer - Matrix Federation

## Installation Options

### Desktop (Recommended)
- **Windows**: Run `CJSR-Setup.exe`
- **macOS**: Open `CJSR.dmg` and drag to Applications
- **Linux**: Run `CJSR.AppImage`

### Web Version
- Open `web/index.html` in your browser
- For best experience, run local server: `cd federation-server && node server-standalone.js`

### Federation Features
- Connect to global CJSR network
- Start your own server node
- Sync progress across devices
- Join inter-server tournaments

## Quick Start
1. Launch CJSR on your platform
2. Create account or play as guest
3. Choose: Local play or Federation connect
4. Start racing and earning XP/QLX!

## Federation Server Setup
```bash
cd federation-server
npm install
node server-standalone.js
```

Visit http://localhost:3000 to access your local CJSR node.

## Support
- Matrix Federation Discord: [Coming Soon]
- Original CJSR: https://chickenjockeyracer.replit.app
- Documentation: [Federation docs in progress]
EOF

# Platform-specific instructions
cat > export-bundle/windows/README-Windows.txt << 'EOF'
CJSR Matrix Federation - Windows Installation

1. Run CJSR-Setup.exe
2. Follow installation wizard
3. Launch from Desktop or Start Menu
4. Create account or continue as guest
5. Join the Matrix Federation!

System Requirements:
- Windows 10 or later
- 4GB RAM minimum
- Internet connection for Federation features

Local Server Mode:
- Run "Start Local Server" from Game menu
- Share with friends on same network
- Access at http://localhost:3000
EOF

cat > export-bundle/mac/README-macOS.txt << 'EOF'
CJSR Matrix Federation - macOS Installation

1. Open CJSR.dmg
2. Drag CJSR to Applications folder
3. Launch from Applications or Launchpad
4. Allow app if prompted by Gatekeeper
5. Join the Matrix Federation!

System Requirements:
- macOS 10.15 or later
- 4GB RAM minimum
- Internet connection for Federation features

Local Server Mode:
- Select "Start Local Server" from Game menu
- Share with friends on same network
- Access at http://localhost:3000
EOF

cat > export-bundle/linux/README-Linux.txt << 'EOF'
CJSR Matrix Federation - Linux Installation

1. Make executable: chmod +x CJSR.AppImage
2. Run: ./CJSR.AppImage
3. Or double-click in file manager
4. Create account or continue as guest
5. Join the Matrix Federation!

System Requirements:
- Modern Linux distribution
- 4GB RAM minimum
- Internet connection for Federation features

Local Server Mode:
- Select "Start Local Server" from Game menu
- Share with friends on same network
- Access at http://localhost:3000

Troubleshooting:
- Install FUSE if AppImage won't run
- Check execute permissions
EOF

echo "✅ Bundle structure created successfully!"
echo "📁 Export location: export-bundle/"
echo ""
echo "Next steps:"
echo "1. Build Electron apps: cd export-bundle && npm install && npm run build-all"
echo "2. Test federation server: cd export-bundle/federation-server && node server-standalone.js"
echo "3. Create itch.io upload packages"
echo ""
echo "🌐 Federation-ready CJSR bundle complete!"
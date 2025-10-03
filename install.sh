#!/bin/bash

echo "Installing Puzzle Master Desktop Application..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    echo
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not available!"
    echo "Please ensure Node.js is properly installed."
    echo
    exit 1
fi

echo "Node.js version:"
node --version
echo "npm version:"
npm --version
echo

echo "Installing Electron dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies!"
    echo
    exit 1
fi

echo
echo "Installation completed successfully!"
echo
echo "To run the desktop application:"
echo "  npm start"
echo
echo "To build the application:"
echo "  npm run build-mac    # for macOS"
echo "  npm run build-linux  # for Linux"
echo

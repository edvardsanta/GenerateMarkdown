#!/bin/bash
set -e

echo "Building Rust WASM package..."

cd rust

if ! command -v wasm-pack &> /dev/null; then
    echo "wasm-pack is not installed. Installing..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

wasm-pack build --target web --out-dir pkg

echo "WASM build completed successfully!"
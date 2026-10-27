date
rm bundle.js
npx esbuild renderer.ts --bundle --format=iife --global-name=SM --outfile=bundle.js
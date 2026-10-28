date
rm bundle.js
tsc && npx esbuild renderer.ts --bundle --format=iife --global-name=SM --outfile=bundle.js

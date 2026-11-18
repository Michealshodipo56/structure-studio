# Minecraft Structure Studio

Local-first Minecraft structure inspection, with world extraction and conversion planned.

## Current status — Phase 1 foundation

- Next.js 15 / React 19 / TypeScript app with responsive interface
- Bedrock little-endian NBT `.mcstructure` parser
- Block palette and two-layer block index decoding
- Interactive Three.js orbit camera, zoom, pan, vertical slicing
- Instanced cube rendering and basic color-coded materials
- Structure dimension and block counts
- Local file reading with a 128 MiB input limit and 16 million-position limit
- Basic tests for Bedrock coordinate indexing and bounds

**Important limitations:** This is not a finished Minecraft renderer. Non-cubic blocks are displayed as cubes, texture atlases are not yet implemented, and block entities are not retained. No world extraction, export, or cross-format conversion is implemented yet. These functions are intentionally not presented as working.

## Run locally

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

Open http://localhost:3000 and import a genuine Bedrock `.mcstructure` file.

## Roadmap

1. Complete and independently verify Bedrock NBT import, block entity retention, and accurate geometry/textures.
2. Implement version-aware parsers, serializers, conversion reports, and round-trip tests.
3. Implement Bedrock LevelDB world parsing, tiled top-down maps, and selection.
4. Implement 3D selection height refinement, extraction, validated export.
5. Add Java worlds and advanced editing.

## Security

Files are read locally in the browser. No upload endpoint is provided. Large and malformed files are rejected. Browser memory use can still be substantial for large imports; more streaming and worker-based limits are planned.

## License

No license granted yet; repository owner must choose one.

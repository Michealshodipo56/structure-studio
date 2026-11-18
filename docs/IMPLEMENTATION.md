# Implementation status

## Phase 1: Bedrock structure viewer (in progress)

Implemented:
- Bedrock little-endian NBT import for uncompressed structures
- Two block-index layers and palette state decoding
- X-major block indexing with bounds checks
- Approximate instanced cube preview, orbit camera, and vertical slicing
- Basic core unit tests

Not yet verified against an independent real-world fixture or production build.
Not implemented: compressed Bedrock v2 structures, exact textures, non-cubic geometry, block entity preservation, entities, export.

## Required validation before declaring Phase 1 complete

1. Run `npm install && npm test && npm run typecheck && npm run build`.
2. Import actual .mcstructure files with empty positions, two layers, and non-cubic blocks.
3. Compare block counts, states, and coordinates against an independent NBT reader.
4. Add golden fixtures and round-trip tests.
5. Test Android Chrome touch gestures and large files.

## Data integrity policy

The viewer does not claim Minecraft-equivalent geometry. No export controls are enabled until a serializer and independent validation tests are implemented. Files are parsed in the browser without an upload API. Large-file memory pressure remains a known limitation.

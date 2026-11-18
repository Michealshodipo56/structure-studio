import * as nbt from "prismarine-nbt";
import { position, volume, type BlockState, type Structure } from "./structure";

function intArray(value: unknown, label: string): number[] {
  // Prismarine-NBT's simplify returns int arrays as arrays; older representations
  // may wrap the numbers in a {value: number[]} object.
  const numbers = Array.isArray(value) ? value :
    value && typeof value === "object" && "value" in value && Array.isArray(value.value) ? value.value : null;
  if (!numbers || !numbers.every((n: unknown) => typeof n === "number" && Number.isSafeInteger(n)))
    throw new Error(`Invalid ${label}: expected an integer array`);
  return numbers;
}

export async function parseMcstructure(buffer: ArrayBuffer): Promise<Structure> {
  if (!buffer.byteLength) throw new Error("Empty structure file");
  if (buffer.byteLength > 128 * 1024 * 1024) throw new Error("File exceeds 128 MiB import limit");
  // Bedrock .mcstructure is little-endian NBT, unlike Java structure templates.
  const { parsed } = await nbt.parse(buffer, "little");
  const data = nbt.simplify(parsed);
  if (!data || typeof data !== "object") throw new Error("Invalid Bedrock NBT root");
  if (data.compression === 1) throw new Error("Compressed Bedrock v2 structures are not supported yet");
  const dimensions = intArray(data.size, "size");
  if (dimensions.length !== 3) throw new Error("Invalid structure dimensions");
  const size: [number, number, number] = [dimensions[0], dimensions[1], dimensions[2]];
  const count = volume(size);
  const structure = data.structure;
  const palette = structure?.palette?.default?.block_palette;
  if (!Array.isArray(palette) || palette.length > 65536) throw new Error("Invalid or missing block palette");
  const rawLayers = structure?.block_indices;
  if (!Array.isArray(rawLayers) || rawLayers.length < 1 || rawLayers.length > 2)
    throw new Error("Expected one or two block index layers");
  const layers = rawLayers.map((v: unknown, index: number) => intArray(v, `block layer ${index}`));
  if (layers.some((v: number[]) => v.length !== count))
    throw new Error("Block index array length does not match dimensions");
  const blocks: Structure["blocks"] = [];
  for (let layer = 0; layer < layers.length; layer++) {
    for (let i = 0; i < count; i++) {
      const paletteIndex = layers[layer][i];
      if (paletteIndex === -1) continue; // unchanged / absent, not air
      if (paletteIndex < 0 || paletteIndex >= palette.length)
        throw new Error(`Invalid palette index ${paletteIndex} at position ${i}`);
      const entry = palette[paletteIndex];
      if (!entry || typeof entry.name !== "string" || !entry.name.trim())
        throw new Error(`Invalid block palette entry ${paletteIndex}`);
      const [x, y, z] = position(i, size);
      const states: BlockState = {};
      if (entry.states && typeof entry.states === "object" && !Array.isArray(entry.states)) {
        for (const [key, value] of Object.entries(entry.states)) {
          if (typeof value === "string" || typeof value === "boolean" ||
              (typeof value === "number" && Number.isFinite(value))) states[key] = value;
        }
      }
      blocks.push({ x, y, z, name: entry.name, states, layer });
    }
  }
  const warnings = ["Preview uses approximate block geometry and colors, not official Minecraft textures."];
  const positionData = structure?.palette?.default?.block_position_data;
  if (positionData && Object.keys(positionData).length)
    warnings.push("Block entity NBT is present but is not yet preserved.");
  if (Array.isArray(structure?.entities) && structure.entities.length)
    warnings.push("Entity NBT is present but is not yet preserved.");
  return { format: "mcstructure", size, blocks, warnings };
}

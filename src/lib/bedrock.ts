import * as nbt from "prismarine-nbt";
import { position, volume, type BlockState, type Structure } from "./structure";
type Tag = { type?: string; value: any };
function unwrap(tag: any): any {
  if (tag && typeof tag === "object" && "type" in tag && "value" in tag) return unwrap(tag.value);
  if (Array.isArray(tag)) return tag.map(unwrap);
  if (tag && typeof tag === "object") return Object.fromEntries(Object.entries(tag).map(([k,v])=>[k,unwrap(v)]));
  return tag;
}
function intArray(tag: any): number[] {
  const value = unwrap(tag);
  if (Array.isArray(value)) return value.map(Number);
  if (value && Array.isArray(value.value)) return value.value.map(Number);
  throw new Error("Invalid NBT integer array");
}
export async function parseMcstructure(buffer: ArrayBuffer): Promise<Structure> {
  if (buffer.byteLength > 128 * 1024 * 1024) throw new Error("File exceeds 128 MiB import limit");
  // Bedrock structure files are little-endian, uncompressed NBT.
  const parsed = await nbt.parse(Buffer.from(buffer), "little");
  const root = (parsed as any).parsed;
  const data = unwrap(root);
  if (!data?.size || !data?.structure?.block_indices || !data?.structure?.palette?.default?.block_palette)
    throw new Error("Not a valid Bedrock .mcstructure file");
  const dimensions = intArray(data.size);
  if (dimensions.length !== 3) throw new Error("Invalid dimensions");
  const size = dimensions as [number,number,number];
  const count = volume(size);
  const layers = data.structure.block_indices.map((v: any)=>intArray(v));
  if (layers.length !== 2 || layers.some((v: number[])=>v.length !== count))
    throw new Error("Invalid block index layers");
  const palette: any[] = data.structure.palette.default.block_palette;
  if (!Array.isArray(palette) || palette.length > 65536) throw new Error("Invalid block palette");
  const blocks: Structure["blocks"] = [];
  const warnings: string[] = [];
  for (let layer = 0; layer < layers.length; layer++) {
    for (let i=0; i<count; i++) {
      const paletteIndex = layers[layer][i];
      if (paletteIndex === -1) continue;
      if (!Number.isInteger(paletteIndex) || paletteIndex < 0 || paletteIndex >= palette.length)
        throw new Error(`Invalid palette index at position ${i}`);
      const entry = palette[paletteIndex];
      if (typeof entry?.name !== "string") throw new Error("Palette entry has no block name");
      const [x,y,z] = position(i,size);
      blocks.push({x,y,z,name:entry.name,states:(entry.states ?? {}) as BlockState,layer});
    }
  }
  if (data.structure.palette.default.block_position_data && Object.keys(data.structure.palette.default.block_position_data).length)
    warnings.push("Block entity data exists but is not yet preserved by this viewer.");
  warnings.push("Complex block shapes and orientations are not yet rendered accurately.");
  return {format:"mcstructure",size,blocks,warnings};
}

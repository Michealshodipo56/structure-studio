export type BlockState = Record<string, string | number | boolean>;
export interface StructureBlock {
  x: number; y: number; z: number;
  name: string;
  states: BlockState;
  layer: number;
}
export interface Structure {
  format: "mcstructure";
  size: readonly [number, number, number];
  blocks: StructureBlock[];
  warnings: string[];
}
export function volume(size: readonly [number, number, number]): number {
  if (size.some(n => !Number.isSafeInteger(n) || n <= 0)) throw new Error("Invalid structure dimensions");
  const result = size[0] * size[1] * size[2];
  if (!Number.isSafeInteger(result) || result > 16_777_216) throw new Error("Structure exceeds safety limit (16 million positions)");
  return result;
}
export function position(index: number, size: readonly [number, number, number]): [number, number, number] {
  const [sx, sy, sz] = size;
  if (!Number.isInteger(index) || index < 0 || index >= volume(size)) throw new RangeError("Block index out of bounds");
  return [Math.floor(index / (sy * sz)), Math.floor(index / sz) % sy, index % sz];
}
export function nonAir(blocks: StructureBlock[]): number {
  return blocks.filter(b => !b.name.endsWith(":air") && b.name !== "air").length;
}

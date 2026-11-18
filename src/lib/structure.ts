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
export function indexOf(x: number, y: number, z: number, size: readonly [number, number, number]): number {
  volume(size);
  if (![x,y,z].every(Number.isInteger) || x < 0 || x >= size[0] || y < 0 || y >= size[1] || z < 0 || z >= size[2])
    throw new RangeError("Block coordinates out of bounds");
  return x * size[1] * size[2] + y * size[2] + z;
}
export function position(index: number, size: readonly [number, number, number]): [number, number, number] {
  const [, sy, sz] = size;
  if (!Number.isInteger(index) || index < 0 || index >= volume(size)) throw new RangeError("Block index out of bounds");
  return [Math.floor(index / (sy * sz)), Math.floor(index / sz) % sy, index % sz];
}
export function isAir(name: string): boolean {
  return name === "air" || name === "minecraft:air" || name === "minecraft:cave_air" || name === "minecraft:void_air";
}
export function nonAir(blocks: StructureBlock[]): number {
  return blocks.filter(b => !isAir(b.name)).length;
}
export function inspectBlock(structure: Structure, x: number, y: number, z: number): StructureBlock[] {
  indexOf(x,y,z,structure.size);
  return structure.blocks.filter(b => b.x === x && b.y === y && b.z === z);
}

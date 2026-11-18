import { test } from "node:test";
import { strict as assert } from "node:assert";
import { position, volume, nonAir } from "./structure";
test("Bedrock X-major position mapping", () => {
  assert.deepEqual(position(0,[2,3,4]),[0,0,0]);
  assert.deepEqual(position(4,[2,3,4]),[0,1,0]);
  assert.deepEqual(position(12,[2,3,4]),[1,0,0]);
  assert.deepEqual(position(23,[2,3,4]),[1,2,3]);
});
test("rejects unsafe dimensions and indices", () => {
  assert.throws(()=>volume([0,2,3]));
  assert.throws(()=>volume([1000,1000,1000]));
  assert.throws(()=>position(24,[2,3,4]));
});
test("counts non-air blocks",()=>assert.equal(nonAir([{x:0,y:0,z:0,name:"minecraft:air",states:{},layer:0},{x:1,y:0,z:0,name:"minecraft:stone",states:{},layer:0}]),1));

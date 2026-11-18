import { test } from "node:test";
import { strict as assert } from "node:assert";
import { position, indexOf, volume, nonAir, inspectBlock } from "./structure";
test("Bedrock X-major position mapping", () => {
  assert.deepEqual(position(0,[2,3,4]),[0,0,0]);
  assert.deepEqual(position(4,[2,3,4]),[0,1,0]);
  assert.deepEqual(position(12,[2,3,4]),[1,0,0]);
  assert.deepEqual(position(23,[2,3,4]),[1,2,3]);
});
test("indexing round-trips all positions", () => {
  const size:[number,number,number]=[4,5,6];
  for(let i=0;i<volume(size);i++) assert.equal(indexOf(...position(i,size),size),i);
});
test("rejects unsafe dimensions and indices", () => {
  assert.throws(()=>volume([0,2,3]));
  assert.throws(()=>volume([1000,1000,1000]));
  assert.throws(()=>position(24,[2,3,4]));
  assert.throws(()=>indexOf(2,0,0,[2,3,4]));
});
test("counts non-air blocks",()=>assert.equal(nonAir([{x:0,y:0,z:0,name:"minecraft:air",states:{},layer:0},{x:1,y:0,z:0,name:"minecraft:stone",states:{},layer:0}]),1));
test("inspects multiple storage layers",()=>{
  const b={x:0,y:0,z:0,name:"minecraft:water",states:{},layer:1};
  assert.deepEqual(inspectBlock({format:"mcstructure",size:[1,1,1],blocks:[b],warnings:[]},0,0,0),[b]);
});

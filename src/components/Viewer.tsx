"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, PerspectiveCamera } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { isAir, type Structure } from "@/lib/structure";
function blockColor(name:string) {
  const n=name.toLowerCase();
  if(n.includes("grass")) return "#659947";
  if(n.includes("leaves")) return "#3b7d43";
  if(n.includes("wood")||n.includes("planks")||n.includes("log")) return "#a37c4d";
  if(n.includes("water")) return "#4386c5";
  if(n.includes("lava")) return "#ed7a2c";
  if(n.includes("sand")) return "#dccb8a";
  if(n.includes("dirt")) return "#79583b";
  if(n.includes("stone")||n.includes("cobble")) return "#888c90";
  if(n.includes("glass")) return "#8dcbd3";
  return "#b3a7a0";
}
export default function Viewer({structure,layer}:{structure:Structure,layer:number|null}) {
  const [sx,sy,sz]=structure.size;
  const groups=useMemo(()=>{
    const m=new Map<string,{color:string;positions:number[][]}>();
    for(const b of structure.blocks) {
      if(isAir(b.name)||(layer!==null&&b.y!==layer)) continue;
      const color=blockColor(b.name);
      if(!m.has(color)) m.set(color,{color,positions:[]});
      m.get(color)!.positions.push([b.x-sx/2+0.5,b.y-sy/2+0.5,b.z-sz/2+0.5]);
    }
    return [...m.values()];
  },[structure,layer,sx,sy,sz]);
  const distance=Math.max(sx,sy,sz)*1.9+8;
  return <Canvas dpr={[1,1.7]} gl={{antialias:true}} style={{width:"100%",height:"100%"}}>
    <color attach="background" args={["#111a24"]}/>
    <ambientLight intensity={1.8}/><directionalLight position={[12,20,8]} intensity={2.2}/>
    <PerspectiveCamera makeDefault position={[distance*.8,distance*.65,distance]} fov={45} near={0.1} far={Math.max(2000,distance*8)}/>
    {groups.map(g=><InstancedBlocks key={g.color} positions={g.positions} color={g.color}/>)}
    <Grid position={[0,-sy/2-0.05,0]} args={[Math.max(sx,20),Math.max(sz,20)]} cellColor="#405060" sectionColor="#526878" fadeDistance={distance*3} infiniteGrid/>
    <OrbitControls makeDefault enableDamping minDistance={1} maxDistance={distance*5}/>
  </Canvas>;
}
function InstancedBlocks({positions,color}:{positions:number[][],color:string}) {
  const mesh=useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(()=>{
    if(!mesh.current) return;
    const matrix=new THREE.Matrix4();
    positions.forEach((p,i)=>mesh.current!.setMatrixAt(i,matrix.makeTranslation(p[0],p[1],p[2])));
    mesh.current.instanceMatrix.needsUpdate=true;
    mesh.current.computeBoundingSphere();
  },[positions]);
  return <instancedMesh ref={mesh} args={[undefined,undefined,positions.length]} frustumCulled={false}>
    <boxGeometry args={[1,1,1]}/><meshLambertMaterial color={color}/>
  </instancedMesh>;
}

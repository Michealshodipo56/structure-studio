"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import type { Structure } from "@/lib/structure";
import { nonAir } from "@/lib/structure";
const Viewer=dynamic(()=>import("@/components/Viewer"),{ssr:false});
export default function Home() {
  const [structure,setStructure]=useState<Structure|null>(null);
  const [filename,setFilename]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [layer,setLayer]=useState<number|null>(null);
  async function upload(file:File) {
    setError("");setBusy(true);setStructure(null);setLayer(null);
    try {
      if(!file.name.toLowerCase().endsWith(".mcstructure")) throw new Error("Phase 1 supports .mcstructure files only");
      const {parseMcstructure}=await import("@/lib/bedrock");
      const parsed=await parseMcstructure(await file.arrayBuffer());
      setStructure(parsed);setFilename(file.name);
    } catch(e){setError(e instanceof Error?e.message:"Could not read structure file");}
    finally{setBusy(false);}
  }
  return <main className="shell">
    <header><div className="brand"><span className="mark">▦</span><span>STRUCTURE <b>STUDIO</b></span></div><span className="version">EARLY ACCESS · PHASE 1</span></header>
    <section className="hero"><span className="eyebrow">MINECRAFT CREATION TOOLKIT</span><h1>Every build deserves<br/><em>another world.</em></h1><p>Inspect Minecraft Bedrock structures in an interactive 3D workspace. Your files stay on your device.</p></section>
    <nav className="modules"><span className="active">01 / Structure Viewer</span><span className="muted">02 / Format Converter · Planned</span><span className="muted">03 / World Explorer · Planned</span></nav>
    {!structure?<section className="upload"><div className="upload-icon">▧</div><h2>Open a structure</h2><p>Choose a Bedrock .mcstructure file to inspect its blocks and dimensions.</p><label className="button">Select structure file<input type="file" accept=".mcstructure" hidden disabled={busy} onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f);e.target.value="";}}/></label>{busy&&<p>Reading structure…</p>}{error&&<p className="error" role="alert">{error}</p>}<small>Local processing · 128 MiB maximum · No upload to server</small></section>:
    <section className="workspace"><div className="viewer"><Viewer structure={structure} layer={layer}/><div className="viewer-label">3D PREVIEW · APPROXIMATE BLOCK GEOMETRY</div></div><aside><div className="aside-head"><span>STRUCTURE DETAILS</span><button onClick={()=>setStructure(null)}>Close ×</button></div><h2>{filename}</h2><dl><dt>Dimensions</dt><dd>{structure.size.join(" × ")}</dd><dt>Non-air blocks</dt><dd>{nonAir(structure.blocks).toLocaleString()}</dd><dt>Format</dt><dd>Bedrock MCSTRUCTURE</dd></dl><label className="field">Vertical slice<select value={layer??"all"} onChange={e=>setLayer(e.target.value==="all"?null:Number(e.target.value))}><option value="all">All layers</option>{Array.from({length:structure.size[1]},(_,i)=><option key={i} value={i}>Y = {i}</option>)}</select></label><h3>Compatibility notes</h3>{structure.warnings.map((w,i)=><p className="warning" key={i}>{w}</p>)}<p className="note">This preview currently uses color-coded cubes, not accurate Minecraft textures or non-cubic block geometry. Export is not enabled until serialization and validation are implemented.</p></aside></section>}
    <footer>Built for creators. Designed for accuracy. <span>Structure Studio © 2026</span></footer>
  </main>;
}

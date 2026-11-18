import type { Metadata } from "next";
import "./style.css";
export const metadata: Metadata = {title:"Minecraft Structure Studio",description:"Local-first Minecraft structure inspection"};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}

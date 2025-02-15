"use client";

import { Scene } from "./Components/Scene";
import React from "react";

export default function Home() {
  return (
    <main className="relative">
     <Scene />
     <section id= "hero"
      className = "h-screen flex items-end jusitfy-center relative"
      >
        <div id="text-1" className="text-cente mb-64 z-10">
          <h1 className="text-8xl font-medium mb-5">
            Welcome to your mama's womb
            </h1> 
            <p className="text-4xl font-light text-gray-500">
              Your mum ray
            </p>
        </div>
      
     </section>
    </main>
  );
}
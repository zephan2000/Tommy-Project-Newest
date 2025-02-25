"use client";

import { Scene } from "./Components/Scene";
import React from "react";

export default function Home() {
  return (
    <main className="relative">
      {/* Render Scene with a high z-index so it appears on top */}
      <div className="absolute inset-0 z-20">
        <Scene />
      </div>

      {/* Text section with a lower z-index */}
      <section
        id="hero"
        className="h-screen flex items-end justify-center relative z-10"
      >
        <div id="text-1" className="text-center mb-64">
          <h1 className="text-8xl font-medium mb-5">
            Welcome to Tommy&apos;s Project
          </h1>
          <p className="text-4xl font-light text-gray-500">
            Please Gib A
          </p>
        </div>
      </section>
    </main>
  );
}
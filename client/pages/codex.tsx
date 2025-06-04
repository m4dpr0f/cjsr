import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CodexCrucible } from "@/components/codex-crucible";

export default function CodexPage() {
  useEffect(() => {
    // Set document title
    document.title = "Egg Shrine - Chicken Jockey Scribe Racer";
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          {/* Removed heading since it's duplicated in the component */}
          <CodexCrucible />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
import React from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TextShrine } from "@/components/text-shrine";

export default function ShrinePage() {
  return (
    <div className="flex flex-col min-h-screen bg-dark">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 bg-dark text-light">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-minecraft text-primary mb-6 text-center">THE CODEX CRUCIBLE</h1>
          
          <p className="text-center mb-8 text-light font-pixel">
            Type the sacred texts to summon powerful Garu Eggs for your collection.
            The quality of your typing affects the power of the resulting egg!
          </p>
          
          <TextShrine />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
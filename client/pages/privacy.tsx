import React from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

export default function PrivacyPage() {
  useEffect(() => {
    document.title = "Privacy Policy - Chicken Jockey Scribe Racer";
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-dark border-2 border-yellow-500 rounded-lg">
              <CardContent className="p-8">
                <h1 className="text-3xl font-minecraft text-cyan-400 mb-6">Privacy Policy</h1>
                
                <div className="prose prose-invert max-w-none">
                  <h2 className="text-2xl font-minecraft text-primary mt-6 mb-4">1. Introduction</h2>
                  
                  <p className="mb-4">
                    Welcome to Chicken Jockey Scribe Racer (CJSR) by TimeKnot Games and 7ABCs.
                  </p>
                  
                  <p className="mb-4">
                    We believe in respecting your privacy and being upfront about how your information is handled. 
                    While we strive to create a safe, ethical, and transparent experience, it's important to acknowledge the broader context:
                  </p>
                  
                  <ul className="list-disc pl-6 mb-6">
                    <li>The modern internet is built on mass surveillance, and absolute privacy in digital spaces is increasingly difficult to guarantee.</li>
                  </ul>
                  
                  <p className="mb-6">
                    That said, we promise to do our part to handle your data responsibly.
                  </p>
                  
                  <h2 className="text-2xl font-minecraft text-primary mt-10 mb-4">2. What We Collect (and Why)</h2>
                  
                  <p className="mb-4">
                    CJSR collects minimal information necessary to provide you with a functional and fun game experience. This may include:
                  </p>
                  
                  <ul className="list-disc pl-6 mb-6">
                    <li>A guest username or optional avatar for gameplay personalization.</li>
                    <li>Typing/scribing performance data (WPM, accuracy) to improve your gameplay stats.</li>
                    <li>Basic analytics (e.g., how often features are used) to help us improve the game.</li>
                  </ul>
                  
                  <p className="mb-4">We do NOT:</p>
                  
                  <ul className="list-disc pl-6 mb-6">
                    <li>Collect sensitive personal data (e.g., addresses, birthdates, payment info).</li>
                    <li>Track your activity across other apps, websites, or services.</li>
                  </ul>
                  
                  <h2 className="text-2xl font-minecraft text-primary mt-10 mb-4">3. How We Use Your Data</h2>
                  
                  <p className="mb-4">
                    We use the limited data we collect strictly for:
                  </p>
                  
                  <ul className="list-disc pl-6 mb-6">
                    <li>Improving gameplay features and performance.</li>
                    <li>Tracking bugs, errors, and usage patterns.</li>
                    <li>Developing new game modes and educational content.</li>
                  </ul>
                  
                  <p className="mb-6">
                    We will never sell, rent, or maliciously exploit your data.
                  </p>
                  
                  <h2 className="text-2xl font-minecraft text-primary mt-10 mb-4">4. Who Has Access</h2>
                  
                  <p className="mb-4">
                    Currently, this project is maintained by a single independent developer working with:
                  </p>
                  
                  <ul className="list-disc pl-6 mb-6">
                    <li>ChatGPT 4.0 (OpenAI) for AI-driven assistance.</li>
                    <li>Replit AI (replit.com) for coding, hosting, and deployment.</li>
                  </ul>
                  
                  <p className="mb-4">
                    While these platforms handle parts of the development process, we do not intentionally share identifiable personal information with them beyond what is necessary to run the game.
                  </p>
                  
                  <p className="mb-4">That said, we must be honest:</p>
                  
                  <ul className="list-disc pl-6 mb-6">
                    <li>The tools and infrastructure we rely on come with their own privacy limitations.</li>
                  </ul>
                  
                  <h2 className="text-2xl font-minecraft text-primary mt-10 mb-4">5. Data Security & Transparency</h2>
                  
                  <ul className="list-disc pl-6 mb-6">
                    <li>We follow best practices for small indie projects to keep your data secure.</li>
                    <li>However, we are not cybersecurity experts and cannot guarantee protection from broader internet vulnerabilities.</li>
                    <li>We pledge to be transparent about any changes to how we collect or use data.</li>
                  </ul>
                  
                  <h2 className="text-2xl font-minecraft text-primary mt-10 mb-4">6. Your Responsibilities & Awareness</h2>
                  
                  <p className="mb-4">By using CJSR, you understand:</p>
                  
                  <ul className="list-disc pl-6 mb-6">
                    <li>You are playing an indie game built with common dev tools (Replit, OpenAI).</li>
                    <li>The broader internet ecosystem is not immune to surveillance.</li>
                    <li>Your use of the game indicates consent to the reasonable and respectful use of your gameplay data as described here.</li>
                  </ul>
                  
                  <h2 className="text-2xl font-minecraft text-primary mt-10 mb-4">7. Contact & Questions</h2>
                  
                  <p className="mb-4">
                    If you have questions, concerns, or suggestions regarding privacy, please reach out:
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li>
                      <span className="text-primary">📧 Email:</span>{" "}
                      <a 
                        href="mailto:timeknotgames@gmail.com"
                        className="text-light hover:text-primary"
                      >
                        timeknotgames@gmail.com
                      </a>
                    </li>
                    <li>
                      <span className="text-primary">🐔 Discord:</span>{" "}
                      <a 
                        href="https://libme.xyz/cjd"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-light hover:text-primary"
                      >
                        libme.xyz/cjd
                      </a>
                    </li>
                    <li>
                      <span className="text-primary">🐦 Twitter:</span>{" "}
                      <a 
                        href="https://x.com/cjsrgame"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-light hover:text-primary"
                      >
                        x.com/cjsrgame
                      </a>
                    </li>
                  </ul>
                  
                  <h2 className="text-2xl font-minecraft text-primary mt-10 mb-4">8. Final Word</h2>
                  
                  <p className="mb-6">
                    We are committed to being good stewards of your data, doing the best we can with the resources we have, and evolving as we grow. 
                    Privacy is a shared responsibility in this digital age.
                  </p>
                  
                  <p className="mb-4">Thank you for trusting us.</p>
                  
                  <p className="text-sm text-gray-400 mt-10">Last updated: May 16, 2025</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
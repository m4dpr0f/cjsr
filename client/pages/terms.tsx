import React from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

export default function TermsPage() {
  useEffect(() => {
    document.title = "Terms of Use - Chicken Jockey Scribe Racer";
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-dark border-2 border-yellow-500 rounded-lg">
              <CardContent className="p-8">
                <h1 className="text-3xl font-minecraft text-cyan-400 mb-6">
                  Terms of Use
                </h1>

                <div className="prose prose-invert max-w-none">
                  <p className="mb-6">
                    Chicken Jockey Scribe Racer (CJSR) is a joyful, educational,
                    and culturally-rooted project created by TimeKnot Games and
                    7ABCs. Drawing inspiration from ancient bird cultures around
                    the world and remixing the viral energy of the chicken
                    jockey meme, CJSR is designed to empower Earth's peoples in
                    the art of scribing—enhancing typing skills, creative
                    expression, and cross-cultural storytelling.
                  </p>

                  <p className="mb-8">
                    CJSR is an independent creative project and is not
                    affiliated with, endorsed by, or connected to any existing
                    brands, platforms, or intellectual properties. We honor the
                    legacy of digital memes and gaming culture while deeply
                    grounding this work in ancestral wisdom, fair use
                    principles, and community stewardship.
                  </p>

                  <h2 className="text-2xl font-minecraft text-primary mt-10 mb-4">
                    License & Usage
                  </h2>

                  <p className="mb-4">
                    CJSR is released under the Creative Commons
                    Attribution-NonCommercial-ShareAlike 4.0 International
                    License (CC BY-NC-SA 4.0).
                  </p>

                  <p className="mb-4">This means:</p>

                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>
                      You can share and adapt this project for non-commercial
                      use.
                    </li>
                    <li>
                      You must credit TimeKnot Games & 7ABCs appropriately.
                    </li>
                    <li>
                      Any derivative works must be shared under the same
                      license.
                    </li>
                    <li>
                      Commercial use requires explicit permission from TimeKnot
                      Games & 7ABCs.
                    </li>
                  </ul>

                  <p className="mb-6">
                    For the full license details, see:
                    <a
                      href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline ml-2"
                    >
                      https://creativecommons.org/licenses/by-nc-sa/4.0/
                    </a>
                  </p>

                  <h2 className="text-2xl font-minecraft text-primary mt-10 mb-4">
                    Community Guidelines
                  </h2>

                  <p className="mb-4">By playing CJSR, you agree to:</p>

                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Respect fellow players and contributors.</li>
                    <li>
                      Use this platform for learning, creativity, and positive
                      community engagement.
                    </li>
                    <li>
                      Not exploit or monetize the CJSR project without
                      permission.
                    </li>
                    <li>
                      Give credit where it's due and honor the spirit of open
                      collaboration.
                    </li>
                  </ul>

                  <h2 className="text-2xl font-minecraft text-primary mt-10 mb-4">
                    Support the Project
                  </h2>

                  <p className="mb-4">
                    You are welcome to support the ongoing development of CJSR
                    by donating to our App Dev Fund:
                  </p>

                  <p className="mb-6">
                    <a
                      href="https://libme.xyz/cjgive"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      ➡️ https://libme.xyz/cjgive
                    </a>
                  </p>

                  <p className="mb-6">
                    Your support helps us keep CJSR free, open, and growing for
                    schools, community servers, and benevolent projects
                    worldwide.
                  </p>

                  <h2 className="text-2xl font-minecraft text-primary mt-10 mb-4">
                    Disclaimers
                  </h2>

                  <ul className="list-disc pl-6 mb-10 space-y-2">
                    <li>
                      <strong>No Microsoft Affiliation:</strong> This project is
                      not an official Minecraft product.
                    </li>
                    <li>
                      <strong>Educational & Cultural Focus:</strong> CJSR is a
                      grassroots tool for skill-building and cultural
                      storytelling.
                    </li>
                    <li>
                      <strong>Respect IP Rights:</strong> All Minecraft-related
                      trademarks and copyrights remain with Mojang/Microsoft.
                    </li>
                  </ul>

                  <h2 className="text-2xl font-minecraft text-primary mt-10 mb-4">
                    Contact
                  </h2>

                  <p className="mb-4">
                    For questions, support, or collaboration inquiries:
                  </p>

                  <ul className="space-y-2 mb-8">
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

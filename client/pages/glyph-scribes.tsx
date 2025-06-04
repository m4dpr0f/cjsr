import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  BookOpen,
  Trophy,
  Star,
  CheckCircle,
  Keyboard,
  ExternalLink,
} from "lucide-react";

// Chapter 1 Adinkra symbols data
const CHAPTER_1_GLYPHS = [
  {
    emoji: "🧿",
    symbolImage: "/DWENNIMMEN.png",
    name: "DWENNIMMEN",
    meaning: "Humility and Strength",
    lore: "Symbol of the ram's horns, representing the balance of humility with strength. The ram fights fiercely, yet humbles itself to kneel.",
  },
  {
    emoji: "💜",
    symbolImage: "/AKOMA.png",
    name: "AKOMA",
    meaning: "Heart, Patience, Endurance",
    lore: "The heart is the seat of patience and compassion in Akan philosophy. One must cultivate 'Akoma' to endure life's trials.",
  },
  {
    emoji: "⚖️",
    symbolImage: "/NYANSAPO.png",
    name: "NYANSAPO",
    meaning: "Wisdom, Ingenuity, Intelligence",
    lore: "The 'wisdom knot' reminds scribes that intelligence must be applied with tact and patience. True wisdom is flexible.",
  },
  {
    emoji: "🤲",
    symbolImage: "/FAWOHODIE.png",
    name: "FAWOHODIE",
    meaning: "Freedom and Emancipation",
    lore: "This symbol honors the struggle for liberation and personal sovereignty. True literacy is a path to freedom.",
  },
  {
    emoji: "🌿",
    symbolImage: "/AYA.png",
    name: "AYA",
    meaning: "Endurance and Defiance",
    lore: "The fern grows in difficult places, thriving where others do not. Aya teaches persistence through adversity.",
  },
  {
    emoji: "💫",
    symbolImage: "/ESE NE TEKREMA.png",
    name: "ESE NE TEKREMA",
    meaning: "Friendship and Interdependence",
    lore: "This symbol shows the tongue and teeth: they may conflict, yet must live together. Balance and harmony are vital.",
  },
  {
    emoji: "🪞",
    symbolImage: "/MATE MASIE.png",
    name: "MATE MASIE",
    meaning: "Understanding, Discernment",
    lore: "'I have heard and kept it.' This symbol honors the power of listening, remembering, and applying learned wisdom.",
  },
  {
    emoji: "🌬️",
    symbolImage: "/NKYINKYIM.png",
    name: "NKYINKYIM",
    meaning: "Initiative and Dynamism",
    lore: "A symbol of life's twists and turns. Scribes must be able to adapt and move with grace through the changing currents.",
  },
  {
    emoji: "🔁",
    symbolImage: "/SESA WO SUBAN.png",
    name: "SESA WO SUBAN",
    meaning: "Transformation and Renewal",
    lore: "A symbol combining a star and a wheel, it shows the perpetual change required for personal and social growth.",
  },
];

export default function GlyphScribes() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentGlyphIndex, setCurrentGlyphIndex] = useState(0);
  const [typingInput, setTypingInput] = useState("");
  const [currentField, setCurrentField] = useState<"name" | "meaning" | "lore">(
    "name",
  );
  const [completedGlyphs, setCompletedGlyphs] = useState<Set<number>>(
    new Set(),
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [startTime] = useState(Date.now());
  const [xpAwarded, setXpAwarded] = useState(0);

  const currentGlyph = CHAPTER_1_GLYPHS[currentGlyphIndex];
  const progress = (completedGlyphs.size / CHAPTER_1_GLYPHS.length) * 100;

  const getExpectedText = () => {
    switch (currentField) {
      case "name":
        return currentGlyph.name;
      case "meaning":
        return currentGlyph.meaning;
      case "lore":
        return currentGlyph.lore;
      default:
        return "";
    }
  };

  const handleInputChange = (value: string) => {
    setTypingInput(value);

    const expected = getExpectedText();
    if (value === expected) {
      // Move to next field or next glyph
      if (currentField === "name") {
        setCurrentField("meaning");
        setTypingInput("");
      } else if (currentField === "meaning") {
        setCurrentField("lore");
        setTypingInput("");
      } else if (currentField === "lore") {
        // Glyph completed
        const newCompleted = new Set(completedGlyphs);
        newCompleted.add(currentGlyphIndex);
        setCompletedGlyphs(newCompleted);

        if (currentGlyphIndex < CHAPTER_1_GLYPHS.length - 1) {
          setCurrentGlyphIndex(currentGlyphIndex + 1);
          setCurrentField("name");
          setTypingInput("");
        } else {
          // All glyphs completed
          setShowSuccess(true);

          // Report completion and handle rewards
          const totalTime = Math.round((Date.now() - startTime) / 1000);
          fetch("/api/glyph-scribes/complete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chapter: "Chapter 1: Symbols of Character",
              tome: "Glyphs of the Ancestors",
              glyphsUnlocked: CHAPTER_1_GLYPHS.length,
              totalTime,
            }),
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              setXpAwarded(data.xpAwarded || 0);
              
              // Show reward notification
              if (data.xpAwarded > 0 || data.qlxAwarded > 0) {
                const rewardText = `${data.xpAwarded > 0 ? `+${data.xpAwarded} XP` : ''}${data.xpAwarded > 0 && data.qlxAwarded > 0 ? ' • ' : ''}${data.qlxAwarded > 0 ? `+${data.qlxAwarded} QLX` : ''}`;
                toast({
                  title: "Chapter Complete!",
                  description: `Earned ${rewardText} for mastering the ancient glyphs`,
                  duration: 3000
                });
              } else {
                toast({
                  title: "Chapter Complete!",
                  description: "You've mastered the ancient glyphs! Log in to earn rewards.",
                  duration: 3000
                });
              }
            }
          })
          .catch((error) => {
            console.error("Failed to report completion:", error);
          });
        }
      }
    }
  };

  const getAccuracy = () => {
    const expected = getExpectedText();
    if (!typingInput) return 100;

    const isCorrectSoFar = expected.startsWith(typingInput);
    return isCorrectSoFar ? 100 : 0;
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-amber-950/20 to-black p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-amber-900/40 via-yellow-900/40 to-orange-900/40 border-amber-500/60">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-amber-200 font-minecraft flex items-center justify-center gap-3">
                <Trophy className="w-8 h-8 text-amber-400" />
                CHAPTER 1 MASTERED!
                <Trophy className="w-8 h-8 text-amber-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl mb-6">🎉</div>
              <h3 className="text-xl text-amber-300 mb-4">
                You have earned the Seal of Character!
              </h3>
              <p className="text-amber-200 mb-6 max-w-2xl mx-auto">
                You have successfully transcribed all 9 Adinkra symbols from
                Chapter 1: Symbols of Character. These sacred glyphs are now
                unlocked in your Personal Glyph Toolkit.
              </p>

              <div className="grid grid-cols-3 gap-2 mb-6 max-w-lg mx-auto">
                {CHAPTER_1_GLYPHS.map((glyph, index) => (
                  <div
                    key={index}
                    className="p-2 bg-amber-900/30 rounded border border-amber-600/40 flex flex-col items-center gap-1"
                  >
                    <img
                      src={glyph.symbolImage}
                      alt={glyph.name}
                      className="w-8 h-8 object-contain filter invert"
                    />
                    <div className="text-lg">{glyph.emoji}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <Button
                  onClick={() => setLocation("/")}
                  className="bg-amber-600 hover:bg-amber-500 text-black font-minecraft"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  RETURN TO HOME
                </Button>

                {/* Future Tome Preview */}
                <Card className="bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-blue-900/20 border-blue-500/40">
                  <CardHeader>
                    <CardTitle className="text-blue-300 font-minecraft text-center text-lg">
                      🔮 Coming in The 9 Tomes of the Visual Realms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-blue-900/20 rounded border border-blue-600/30">
                        <div className="text-xl mb-2">📜</div>
                        <div className="font-bold text-blue-200">
                          Tome 2: Signs of the Nile
                        </div>
                        <div className="text-blue-300">
                          Egyptian Hieroglyphs
                        </div>
                        <div className="text-xs text-blue-400 mt-1">
                          Classical Kemetic writing
                        </div>
                        <div className="text-xs text-blue-300 mt-2">
                          <a
                            href="https://jsesh.qenherkhopeshef.org/"
                            target="_blank"
                            className="underline hover:text-blue-200"
                          >
                            JSesh Typing Tool
                          </a>{" "}
                          •
                          <a
                            href="https://www.omniglot.com/writing/egyptian.htm"
                            target="_blank"
                            className="underline hover:text-blue-200"
                          >
                            Hieroglyph Guide
                          </a>
                        </div>
                      </div>

                      <div className="text-center p-3 bg-purple-900/20 rounded border border-purple-600/30">
                        <div className="text-xl mb-2">🏛️</div>
                        <div className="font-bold text-purple-200">
                          Tome 3: Glyphs of the Dreamtime
                        </div>
                        <div className="text-purple-300">
                          Aboriginal Dot & Symbol Art
                        </div>
                        <div className="text-xs text-purple-400 mt-1">
                          Songlines and myth-maps
                        </div>
                        <div className="text-xs text-purple-300 mt-2">
                          Traditional symbols & pictographs
                        </div>
                      </div>

                      <div className="text-center p-3 bg-green-900/20 rounded border border-green-600/30">
                        <div className="text-xl mb-2">⛩️</div>
                        <div className="font-bold text-green-200">
                          Tome 5: Scrolls of the Yamabushi
                        </div>
                        <div className="text-green-300">
                          Japanese Mon & Symbol Kanji
                        </div>
                        <div className="text-xs text-green-400 mt-1">
                          Family crests and ideograms
                        </div>
                        <div className="text-xs text-green-300 mt-2">
                          <a
                            href="https://www.tofugu.com/japanese/"
                            target="_blank"
                            className="underline hover:text-green-200"
                          >
                            Japanese Setup Guide
                          </a>{" "}
                          •
                          <a
                            href="https://www.wanikani.com/"
                            target="_blank"
                            className="underline hover:text-green-200"
                          >
                            Kanji Learning
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      <div className="text-xs text-blue-400/80">
                        <strong>72 Total Glyphs</strong> across all 9 tomes •
                        Each representing authentic cultural wisdom traditions
                      </div>
                      <div className="text-xs text-blue-400/60 mt-1">
                        Unlock access to /cryp70f43 campaign by mastering all
                        tomes
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tome 1 Chapter Overview */}
                <Card className="bg-amber-900/10 border-amber-600/30 mb-6">
                  <CardHeader>
                    <CardTitle className="text-amber-300 font-minecraft text-center text-lg">
                      📚 Tome 1: Glyphs of the Ancestors - Full Chapter Preview
                    </CardTitle>
                    <p className="text-center text-amber-400/80 text-sm">
                      West African Adinkra Wisdom Symbols
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-amber-900/20 rounded border border-amber-600/40">
                        <div className="font-bold text-amber-200 mb-2">
                          ✅ Chapter 1: Symbols of Character
                        </div>
                        <div className="text-xs text-amber-300 space-y-1">
                          <div>🧿 DWENNIMMEN • 💜 AKOMA • ⚖️ NYANSAPO</div>
                          <div>🤲 FAWOHODIE • 🌿 AYA • 💫 ESE NE TEKREMA</div>
                          <div>
                            🪞 MATE MASIE • 🌬️ NKYINKYIM • 🔁 SESA WO SUBAN
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-900/15 rounded border border-amber-600/30">
                        <div className="font-bold text-amber-300 mb-2">
                          🔒 Chapter 2: Symbols of Leadership
                        </div>
                        <div className="text-xs text-amber-400 space-y-1">
                          <div>👑 ADINKRAHENE • 🗡️ AKOFENA • 📯 AKOBEN</div>
                          <div>
                            🧱 MFRAMADAN • 🧑‍⚖️ EPA • 🪶 NEA OPE SE OBEDI HENE
                          </div>
                          <div>
                            🕊️ BI NKA BI • 🫱 BOA ME NA ME MMOA WO • 🫂 AKOMA
                            NTOSO
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-900/15 rounded border border-amber-600/30">
                        <div className="font-bold text-amber-300 mb-2">
                          🔒 Chapter 3: Symbols of Earth and Nature
                        </div>
                        <div className="text-xs text-amber-400 space-y-1">
                          <div>🌍 ASASE YE DURU • 🪴 DUAFE • 🌼 FOFO</div>
                          <div>
                            🐍 DENKYEM • 🦅 OKODEE MMOWERE • 🌱 WAWA ABA
                          </div>
                          <div>🏡 FIHANKRA • 🧱 EBAN • 💧 MMUSUYIDEE</div>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-900/15 rounded border border-amber-600/30">
                        <div className="font-bold text-amber-300 mb-2">
                          🔒 Chapter 4: Symbols of Community
                        </div>
                        <div className="text-xs text-amber-400 space-y-1">
                          <div>🔗 NKONSONKONSON • 🫓 NSAA • 🧺 BESE SAKA</div>
                          <div>
                            🌙 OSRAM NE NSOROMMA • 💞 ODO NNYEW FIE KWAN
                          </div>
                          <div>
                            🔗 MPATAPO • 🔄 MMERE DANE • 🛖 KETE PA • 🙋‍♂️ ME WARE
                            WO
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-900/15 rounded border border-amber-600/30">
                        <div className="font-bold text-amber-300 mb-2">
                          🔒 Chapter 5: Symbols of Divine Presence
                        </div>
                        <div className="text-xs text-amber-400 space-y-1">
                          <div>
                            ✝️ GYE NYAME • 🌳 NYAME DUA • 👑 NYAME YE OHENE
                          </div>
                          <div>💫 NYAME NNWU NA MAWU • 🪶 NYAME NTI</div>
                          <div>
                            🌌 NYAME BIRIBI WO SORO • 🙌 NSOROMMA • 🌟
                            ONYANKOPON ADOM NTI • 🔮 HWEMUDUA
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-900/15 rounded border border-amber-600/30">
                        <div className="font-bold text-amber-300 mb-2">
                          🔒 Chapter 6: Symbols of Conflict and Resilience
                        </div>
                        <div className="text-xs text-amber-400 space-y-1">
                          <div>🐊 FUNTUNFUNEFU DENKYEMFUNEFU • 🧶 NKYIMU</div>
                          <div>
                            🐍 OWO FORO ADOBE • 🔥 HYE WON HYE • 🧵 PEMPAMSIE
                          </div>
                          <div>
                            🪜 OWUO ATWEDEE • 🛑 TAMFO BEBRE • 🎲 DAME-DAME • 🤝
                            ESE NE TEKREMA
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-900/15 rounded border border-amber-600/30">
                        <div className="font-bold text-amber-300 mb-2">
                          🔒 Chapter 7: Symbols of Knowledge and Learning
                        </div>
                        <div className="text-xs text-amber-400 space-y-1">
                          <div>📚 NEA ONNIM NO SUA A, OHU • 💬 DAME-DAME</div>
                          <div>🧠 NYANSAPO • 📐 HWEMUDUA • 🎓 KINTINKANTAN</div>
                          <div>
                            👁️ KETEKETE • 🧩 MMERE DANE • 📘 NKYINKYIM • 🔄 SESA
                            WO SUBAN
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-900/15 rounded border border-amber-600/30">
                        <div className="font-bold text-amber-300 mb-2">
                          🔒 Chapter 8: Initiation of the Glyph Scribe
                        </div>
                        <div className="text-xs text-amber-400 space-y-1">
                          <div>
                            🌀 Composite Symbol Creation • 🎨 Scribe's Seal
                            Design
                          </div>
                          <div>
                            💬 Interpretive Reflection • 📖 Meaning Quiz
                          </div>
                          <div>
                            🧾 Sacred Proverb Transcription • 🎤 Oral Test • ✍️
                            Symbol Pairing
                          </div>
                          <div className="text-amber-300 font-bold">
                            🔐 Unlock /cryp70f43 Access
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center mt-4 p-3 bg-amber-900/30 rounded border border-amber-600/50">
                      <div className="text-sm text-amber-200 font-bold">
                        72 Authentic Adinkra Symbols • 8 Complete Chapters
                      </div>
                      <div className="text-xs text-amber-300 mt-1">
                        Each symbol represents genuine West African wisdom
                        traditions from the Akan people of Ghana
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <div className="text-sm text-amber-400/80">
                    <strong>Next:</strong> Chapter 2: Symbols of Leadership
                  </div>
                  <div className="text-xs text-amber-500/70 mt-1">
                    Available after completing Chapter 1 with 100% accuracy
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-amber-950/20 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6 bg-gradient-to-r from-amber-900/40 via-yellow-900/40 to-orange-900/40 border-amber-500/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setLocation("/")}
                  className="text-amber-300 hover:text-amber-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-blue-300 hover:text-blue-200"
                    >
                      <Keyboard className="w-4 h-4 mr-2" />
                      Typing Setup
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-blue-500/50">
                    <DialogHeader>
                      <DialogTitle className="text-blue-300 text-xl">
                        🌐 Multi-Language Typing Setup Guide
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-sm">
                      <div className="p-3 bg-blue-900/20 rounded border border-blue-600/30">
                        <h3 className="font-bold text-blue-200 mb-2">
                          🧿 Chinese Characters (汉字)
                        </h3>
                        <div className="space-y-1 text-blue-100 text-xs">
                          <div>
                            <strong>Windows:</strong> Settings → Time & Language
                            → Add "Chinese (Simplified)" → Microsoft Pinyin
                          </div>
                          <div>
                            <strong>Mac:</strong> System Settings → Keyboard →
                            Input Sources → Add "Chinese - Simplified (Pinyin)"
                          </div>
                          <div>
                            <strong>Mobile:</strong> Add Chinese keyboard in
                            keyboard settings
                          </div>
                          <div className="text-blue-300 mt-2">
                            <strong>Resources:</strong>
                            <a
                              href="https://www.hellochinese.cc/"
                              target="_blank"
                              className="underline ml-1 hover:text-blue-200"
                            >
                              HelloChinese
                            </a>{" "}
                            •
                            <a
                              href="https://www.mdbg.net/chinese/dictionary"
                              target="_blank"
                              className="underline ml-1 hover:text-blue-200"
                            >
                              MDBG Dictionary
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-orange-900/20 rounded border border-orange-600/30">
                        <h3 className="font-bold text-orange-200 mb-2">
                          🏺 Egyptian Hieroglyphs
                        </h3>
                        <div className="space-y-1 text-orange-100 text-xs">
                          <div>
                            <strong>Typing Tool:</strong> Use JSesh online
                            editor for authentic hieroglyphic composition
                          </div>
                          <div>
                            <strong>Alternative:</strong> Unicode Egyptian
                            hieroglyph blocks (limited selection)
                          </div>
                          <div className="text-orange-300 mt-2">
                            <strong>Resources:</strong>
                            <a
                              href="https://jsesh.qenherkhopeshef.org/"
                              target="_blank"
                              className="underline ml-1 hover:text-orange-200"
                            >
                              JSesh Editor
                            </a>{" "}
                            •
                            <a
                              href="https://www.omniglot.com/writing/egyptian.htm"
                              target="_blank"
                              className="underline ml-1 hover:text-orange-200"
                            >
                              Hieroglyph Guide
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-green-900/20 rounded border border-green-600/30">
                        <h3 className="font-bold text-green-200 mb-2">
                          ⛩️ Japanese (日本語)
                        </h3>
                        <div className="space-y-1 text-green-100 text-xs">
                          <div>
                            <strong>Windows:</strong> Add "Japanese" language →
                            Microsoft IME
                          </div>
                          <div>
                            <strong>Mac:</strong> Add "Japanese" → Hiragana
                            input method
                          </div>
                          <div>
                            <strong>Typing:</strong> Type phonetically (e.g.,
                            "ka" → か, "kanji" → 漢字)
                          </div>
                          <div className="text-green-300 mt-2">
                            <strong>Resources:</strong>
                            <a
                              href="https://www.tofugu.com/japanese/"
                              target="_blank"
                              className="underline ml-1 hover:text-green-200"
                            >
                              Tofugu Guide
                            </a>{" "}
                            •
                            <a
                              href="https://www.wanikani.com/"
                              target="_blank"
                              className="underline ml-1 hover:text-green-200"
                            >
                              WaniKani
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-purple-900/20 rounded border border-purple-600/30">
                        <h3 className="font-bold text-purple-200 mb-2">
                          🌙 Arabic (العربية)
                        </h3>
                        <div className="space-y-1 text-purple-100 text-xs">
                          <div>
                            <strong>Windows:</strong> Add "Arabic" language pack
                          </div>
                          <div>
                            <strong>Mac:</strong> Add "Arabic" keyboard layout
                          </div>
                          <div>
                            <strong>Direction:</strong> Right-to-left script
                          </div>
                          <div className="text-purple-300 mt-2">
                            <strong>Resources:</strong>
                            <a
                              href="https://www.lexilogos.com/keyboard/arabic.htm"
                              target="_blank"
                              className="underline ml-1 hover:text-purple-200"
                            >
                              Arabic Keyboard
                            </a>{" "}
                            •
                            <a
                              href="https://www.arabicpod101.com/"
                              target="_blank"
                              className="underline ml-1 hover:text-purple-200"
                            >
                              ArabicPod101
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-yellow-900/20 rounded border border-yellow-600/30">
                        <h3 className="font-bold text-yellow-200 mb-2">
                          ✡️ Hebrew (עברית)
                        </h3>
                        <div className="space-y-1 text-yellow-100 text-xs">
                          <div>
                            <strong>Windows:</strong> Add "Hebrew" in language
                            settings
                          </div>
                          <div>
                            <strong>Mac:</strong> Add "Hebrew" keyboard layout
                          </div>
                          <div>
                            <strong>Direction:</strong> Right-to-left script
                            like Arabic
                          </div>
                          <div className="text-yellow-300 mt-2">
                            <strong>Resources:</strong>
                            <a
                              href="https://www.hebrewpod101.com/"
                              target="_blank"
                              className="underline ml-1 hover:text-yellow-200"
                            >
                              HebrewPod101
                            </a>{" "}
                            •
                            <a
                              href="https://www.pealim.com/"
                              target="_blank"
                              className="underline ml-1 hover:text-yellow-200"
                            >
                              Pealim Verbs
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-red-900/20 rounded border border-red-600/30">
                        <h3 className="font-bold text-red-200 mb-2">
                          🕉️ Sanskrit (संस्कृत)
                        </h3>
                        <div className="space-y-1 text-red-100 text-xs">
                          <div>
                            <strong>Script:</strong> Devanagari (same as Hindi)
                          </div>
                          <div>
                            <strong>Setup:</strong> Add "Hindi" keyboard for
                            Devanagari script
                          </div>
                          <div>
                            <strong>Tool:</strong> Google Input Tools for
                            Sanskrit transliteration
                          </div>
                          <div className="text-red-300 mt-2">
                            <strong>Resources:</strong>
                            <a
                              href="https://learnsanskrit.org/"
                              target="_blank"
                              className="underline ml-1 hover:text-red-200"
                            >
                              Learn Sanskrit
                            </a>{" "}
                            •
                            <a
                              href="https://www.sanskritdictionary.com/"
                              target="_blank"
                              className="underline ml-1 hover:text-red-200"
                            >
                              Sanskrit Dictionary
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-cyan-900/20 rounded border border-cyan-600/30">
                        <h3 className="font-bold text-cyan-200 mb-2">
                          💡 General Tips
                        </h3>
                        <div className="space-y-1 text-cyan-100 text-xs">
                          <div>
                            <strong>Switching:</strong> Windows Key + Space
                            (Windows) or Control + Space (Mac)
                          </div>
                          <div>
                            <strong>Practice:</strong> Start with common words
                            and characters
                          </div>
                          <div>
                            <strong>Learning:</strong> Each script has its own
                            learning curve - be patient!
                          </div>
                          <div>
                            <strong>Built-in Help:</strong> Most systems include
                            keyboard tutorials
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="text-center">
                <CardTitle className="text-2xl text-amber-200 font-minecraft">
                  Chapter 1: Symbols of Character
                </CardTitle>
                <div className="text-sm text-amber-300">
                  Glyph {currentGlyphIndex + 1} of {CHAPTER_1_GLYPHS.length}
                </div>
              </div>
              <div className="text-amber-300">
                <Badge
                  variant="outline"
                  className="border-amber-500 text-amber-200"
                >
                  {completedGlyphs.size}/{CHAPTER_1_GLYPHS.length} Complete
                </Badge>
              </div>
            </div>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
        </Card>

        {/* Development Notice */}
        <Card className="mb-6 bg-amber-800/20 border-amber-600/50">
          <CardContent className="p-4">
            <div className="text-center text-amber-200/90 text-sm space-y-2">
              <div>
                <strong>⚠️ Early Development Notice</strong>
              </div>
              <div className="text-xs text-amber-300/80">
                This GLYPH SCRIBES feature is in active development. Major
                improvements planned include authentic Adinkra symbol graphics,
                expanded cultural content, enhanced learning mechanics, and
                deeper integration with West African wisdom traditions.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Glyph */}
        <Card className="mb-6 bg-black/60 border-amber-500/40">
          <CardHeader>
            <div className="text-center">
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className="flex flex-col items-center">
                  <div className="text-xs text-amber-400 mb-1">
                    Authentic Symbol
                  </div>
                  <img
                    src={currentGlyph.symbolImage}
                    alt={currentGlyph.name}
                    className="w-20 h-20 object-contain filter invert"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-xs text-amber-400 mb-1">
                    Emoji Approximation
                  </div>
                  <div className="text-6xl">{currentGlyph.emoji}</div>
                </div>
              </div>
              <h2 className="text-3xl font-minecraft text-amber-200 mb-2">
                {currentGlyph.name}
              </h2>
              <p className="text-lg text-amber-300">{currentGlyph.meaning}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-900/20 p-4 rounded border border-amber-600/40 mb-6">
              <p className="text-amber-100 text-center italic">
                "{currentGlyph.lore}"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Typing Challenge */}
        <Card className="bg-black/60 border-amber-500/40">
          <CardHeader>
            <CardTitle className="text-amber-200 font-minecraft text-center">
              Transcription Challenge
            </CardTitle>
            <div className="text-center">
              <Badge
                variant="outline"
                className={`border-amber-500 ${
                  currentField === "name"
                    ? "bg-amber-600 text-black"
                    : "text-amber-200"
                }`}
              >
                Name
              </Badge>
              <span className="mx-2 text-amber-400">→</span>
              <Badge
                variant="outline"
                className={`border-amber-500 ${
                  currentField === "meaning"
                    ? "bg-amber-600 text-black"
                    : "text-amber-200"
                }`}
              >
                Meaning
              </Badge>
              <span className="mx-2 text-amber-400">→</span>
              <Badge
                variant="outline"
                className={`border-amber-500 ${
                  currentField === "lore"
                    ? "bg-amber-600 text-black"
                    : "text-amber-200"
                }`}
              >
                Lore
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-amber-300 mb-2">
                  Type the {currentField} exactly as shown:
                </p>
                <div className="text-xl font-mono text-amber-200 bg-black/40 p-3 rounded border border-amber-600/40">
                  {getExpectedText()}
                </div>
              </div>

              <Input
                value={typingInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={`Type the ${currentField}...`}
                className="text-lg font-mono bg-black/60 border-amber-500/40 text-amber-200 focus:border-amber-400"
                autoFocus
              />

              <div className="text-center">
                <div
                  className={`text-sm ${getAccuracy() === 100 ? "text-green-400" : "text-red-400"}`}
                >
                  Accuracy: {getAccuracy()}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cultural Attribution */}
        <Card className="mt-6 bg-amber-900/20 border-amber-600/40">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-amber-400/80">
              <p className="mb-2">
                <strong>Cultural Source:</strong> Adinkra symbols from Ghana's
                Akan tradition
              </p>
              <div className="space-x-4">
                <button
                  onClick={() =>
                    window.open(
                      "https://en.wikipedia.org/wiki/Adinkra_symbols",
                      "_blank",
                    )
                  }
                  className="text-amber-300 hover:text-amber-200 underline"
                >
                  📚 Wikipedia: Adinkra Symbols
                </button>
                <button
                  onClick={() =>
                    window.open(
                      "https://libraryofmeme.wordpress.com/wp-content/uploads/2025/06/adinkra.org-index.pdf",
                      "_blank",
                    )
                  }
                  className="text-amber-300 hover:text-amber-200 underline"
                >
                  🔗 Adinkra Symbol Reference
                </button>
              </div>
              <div className="mt-2 text-xs text-amber-500/70">
                Note: Emoji representations are approximations. Authentic
                Adinkra graphics will be integrated in future updates.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

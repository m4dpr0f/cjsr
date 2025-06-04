import { useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Help() {
  useEffect(() => {
    document.title = "Help - Chicken Jockey Scribe Racer";
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-pixel text-primary mb-6 text-center">Help & Information</h1>
        
        <div className="max-w-3xl mx-auto">
          <Card className="bg-dark pixel-border mb-6">
            <CardHeader>
              <CardTitle className="text-secondary font-pixel">ABOUT CHICKEN JOCKEY</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert">
              <p>
                Chicken Jockey is a typing-based racing minigame where players race chickens by typing text prompts
                accurately and quickly. It's inspired by Minecraft's chicken jockey mob and designed as both a web-based 
                multiplayer game and a Minecraft-integrated minigame.
              </p>
              <p>
                The game features customizable chickens and jockeys, XP-based progression, and a unique system where 
                players create the text prompts for future races.
              </p>
              <div className="bg-primary/20 border border-primary/40 rounded-md p-3 mt-4">
                <h3 className="text-primary font-bold text-lg mb-2">✨ Cross-Platform Play</h3>
                <p className="text-sm mb-2">
                  ChickenJockeySR supports full crossplay between mobile and desktop devices. Race against friends 
                  no matter what device they're using!
                </p>
                <h3 className="text-primary font-bold text-lg mb-2">🌟 Our Accessibility Vision</h3>
                <p className="text-sm">
                  CJSR's long-term vision is to be truly inclusive "poly-scribes" - enabling cooperative and competitive races 
                  between people of all abilities. Future updates will include speech-to-text support and other accessibility 
                  features in alignment with universal access design principles.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Accordion type="single" collapsible className="mb-6">
            <AccordionItem value="item-1" className="bg-dark pixel-border mb-4 border-0">
              <AccordionTrigger className="px-4 py-2 font-pixel text-primary">
                HOW TO PLAY
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div className="mb-2">
                    <h3 className="text-secondary font-bold mb-1">For All Users:</h3>
                    <ol className="space-y-2 text-light">
                      <li>1. Join a race by clicking "MULTIPLAYER" on the home screen OR by clicking RACE above.</li>
                      <li>2. In the race lobby, click the "JOIN RACE" button.</li>
                      <li>3. Wait for the countdown to start or add NPC opponents.</li>
                      <li>4. When the race begins, a prompt will be displayed on your screen.</li>
                      <li>5. Type the prompt as quickly and accurately as possible.</li>
                      <li>6. Your chicken jockey will move forward as you type correctly.</li>
                      <li>7. The first player to finish typing the entire prompt wins!</li>
                      <li>8. The winner can submit a new prompt for future races.</li>
                      <li>9. All players earn XP based on their performance.</li>
                    </ol>
                  </div>
                  
                  <div className="mb-2">
                    <h3 className="text-secondary font-bold mb-1">For Mobile Users:</h3>
                    <ul className="list-disc pl-5 text-light">
                      <li>Tap the text input area to bring up your keyboard.</li>
                      <li>The mobile keyboard will appear automatically when the race starts.</li>
                      <li>Your current word to type will be highlighted in a different color.</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-secondary font-bold mb-1">For Desktop Users:</h3>
                    <ul className="list-disc pl-5 text-light">
                      <li>No need to click anywhere - just start typing when the race begins.</li>
                      <li>Press Tab to automatically correct your current word and move to the next one.</li>
                      <li>Use browser zoom controls (Ctrl +/-) if the text is too small or large.</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="bg-dark pixel-border mb-4 border-0">
              <AccordionTrigger className="px-4 py-2 font-pixel text-primary">
                GAME MODES
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-4 text-light">
                  <li>
                    <h3 className="text-secondary font-bold">Quick Race</h3>
                    <p>Jump straight into a race with random players. Perfect for a quick typing challenge.</p>
                  </li>
                  <li>
                    <h3 className="text-secondary font-bold">Multiplayer</h3>
                    <p>Create or join custom race lobbies where you can invite friends or wait for other players.</p>
                  </li>
                  <li>
                    <h3 className="text-secondary font-bold">Practice</h3>
                    <p>Race against the clock with no other players. Great for improving your typing skills.</p>
                  </li>
                  <li>
                    <h3 className="text-secondary font-bold">Fork Campaign</h3>
                    <p>A narrative-based campaign where you choose your character and path through the story. Each choice affects dialogues and challenges.</p>
                  </li>
                  <li>
                    <h3 className="text-secondary font-bold">Tournaments</h3>
                    <p>Coming soon! Compete in structured competitions with multiple races and prizes.</p>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="bg-dark pixel-border mb-4 border-0">
              <AccordionTrigger className="px-4 py-2 font-pixel text-primary">
                PROGRESSION SYSTEM
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2 text-light">
                  <p>
                    Chicken Jockey features an XP-based progression system:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Earn XP after each race based on your performance.</li>
                    <li>Gain levels as you accumulate XP.</li>
                    <li>Unlock new chicken breeds, jockey types, and cosmetic effects as you level up.</li>
                    <li>Higher levels unlock rarer and more impressive customizations.</li>
                    <li>Your level is displayed next to your name during races.</li>
                  </ul>
                  <p>
                    The XP formula rewards both speed and accuracy, so focus on typing correctly, not just quickly!
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="bg-dark pixel-border mb-4 border-0">
              <AccordionTrigger className="px-4 py-2 font-pixel text-primary">
                PROMPT SYSTEM
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2 text-light">
                  <p>
                    One of the unique features of Chicken Jockey is our player-generated prompt system:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>The winner of each race can submit a new typing prompt.</li>
                    <li>This prompt will be used in future races.</li>
                    <li>Prompts must be between 50-250 characters.</li>
                    <li>All prompts are moderated to ensure they're appropriate.</li>
                    <li>This creates a constantly growing and evolving pool of typing challenges.</li>
                    <li>Prompts can be fun, challenging, creative, or educational!</li>
                  </ul>
                  <p>
                    Think carefully about your prompt when you win - make it interesting for future racers!
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Card className="bg-dark pixel-border mb-6">
            <CardHeader>
              <CardTitle className="text-secondary font-pixel">FREQUENTLY ASKED QUESTIONS</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="faq-1">
                  <AccordionTrigger className="text-primary">
                    How is my typing speed calculated?
                  </AccordionTrigger>
                  <AccordionContent className="text-light">
                    Typing speed is calculated in Words Per Minute (WPM). In Chicken Jockey, we use the standard
                    definition where 1 word equals 5 characters. Your WPM is calculated by dividing the number of
                    characters you've typed by 5, then dividing by the elapsed time in minutes.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="faq-2">
                  <AccordionTrigger className="text-primary">
                    What happens if I make a typo?
                  </AccordionTrigger>
                  <AccordionContent className="text-light">
                    When you make a typo, the input field will flash red to indicate the error. You'll need to
                    use the backspace key to correct your mistake before continuing. This affects your accuracy
                    score but gives you a chance to fix errors rather than being stuck.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="faq-3">
                  <AccordionTrigger className="text-primary">
                    How do I unlock new chickens and jockeys?
                  </AccordionTrigger>
                  <AccordionContent className="text-light">
                    New chickens, jockeys, and trail effects are unlocked by reaching certain level thresholds.
                    You can see which items are available and their required levels in the Profile {'>'} Customize section.
                    Keep racing to earn XP and level up to unlock all the customization options!
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="faq-4">
                  <AccordionTrigger className="text-primary">
                    Can I create a private race with just my friends?
                  </AccordionTrigger>
                  <AccordionContent className="text-light">
                    This feature is coming soon! In a future update, you'll be able to create private lobbies
                    with a share code that you can give to your friends to join. For now, you can use the
                    Multiplayer mode and coordinate joining at the same time.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="faq-5">
                  <AccordionTrigger className="text-primary">
                    Is there a Minecraft integration?
                  </AccordionTrigger>
                  <AccordionContent className="text-light">
                    Yes! We're working on a Minecraft plugin that will allow you to play Chicken Jockey
                    directly in Minecraft. You'll be able to see the chicken jockeys race in-game as players
                    type in the web interface or in Minecraft chat. This feature is still in development.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
          
          <Card className="bg-dark pixel-border">
            <CardHeader>
              <CardTitle className="text-secondary font-pixel">CONTACT & SUPPORT</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-light mb-4">
                If you have any questions, feedback, or issues with Chicken Jockey, please don't hesitate to reach out:
              </p>
              <ul className="space-y-2 text-light">
                <li>
                  <span className="text-primary">Email:</span>{" "}
                  <a 
                    href="mailto:timeknotgames@gmail.com"
                    className="text-light hover:text-primary"
                  >
                    timeknotgames@gmail.com
                  </a>
                </li>
                <li>
                  <span className="text-primary">Discord:</span>{" "}
                  <a 
                    href="https://libraryofmeme.com/cjdisco"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-light hover:text-primary"
                  >
                    libraryofmeme.com/cjdisco
                  </a>
                </li>
                <li>
                  <span className="text-primary">Twitter:</span>{" "}
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
              <div className="mt-6 pt-4 border-t border-gray-700">
                <a 
                  href="https://libraryofmeme.com/cjfeedback"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-dark font-bold rounded-md inline-block transition-colors"
                >
                  SUBMIT FEEDBACK
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

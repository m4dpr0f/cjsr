import React from 'react';
import { Mail, MessageSquare, Twitter } from 'lucide-react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto bg-dark border-2 border-yellow-500 rounded-lg p-8">
            <h1 className="text-3xl font-minecraft text-cyan-400 mb-6">CONTACT & SUPPORT</h1>
            
            <p className="text-light mb-8 text-lg">
              If you have any questions, feedback, or issues with Chicken Jockey, please don't hesitate to reach out:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-yellow-500 font-medium min-w-20">Email:</span>
                <a 
                  href="mailto:timeknotgames@gmail.com" 
                  className="text-light hover:text-primary flex items-center gap-2"
                >
                  <Mail className="h-5 w-5" />
                  timeknotgames@gmail.com
                </a>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-yellow-500 font-medium min-w-20">Discord:</span>
                <a 
                  href="https://libraryofmeme.com/cjdisco" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light hover:text-primary flex items-center gap-2"
                >
                  <MessageSquare className="h-5 w-5" />
                  libraryofmeme.com/cjdisco
                </a>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-yellow-500 font-medium min-w-20">Twitter:</span>
                <a 
                  href="https://x.com/cjsrgame"
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-light hover:text-primary flex items-center gap-2"
                >
                  <Twitter className="h-5 w-5" />
                  x.com/cjsrgame
                </a>
              </div>
            </div>
            
            <div className="mt-10 pt-6 border-t border-gray-700">
              <h2 className="text-xl font-minecraft text-cyan-400 mb-4">FEEDBACK FORM</h2>
              <p className="text-light mb-6">
                Have specific feedback? We'd love to hear from you! Visit our feedback form:
              </p>
              <a 
                href="https://libraryofmeme.com/cjfeedback"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-dark font-bold rounded-md inline-block transition-colors"
              >
                SUBMIT FEEDBACK
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
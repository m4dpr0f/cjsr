import { Link } from "wouter";
import { Mail, MessageSquare, Twitter } from "lucide-react";
import timeknotLogo from "../assets/images/timeknot-logo.png";
import sevenAbcsLogo from "../assets/images/7abcs-logo.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark px-4 py-3 border-t-4 border-primary mt-auto">
      <div className="container mx-auto flex flex-col items-center">
        {/* Company Logos */}
        <div className="flex justify-center items-center gap-6 mb-4">
          <a
            href="https://timeknotgames.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            title="TimeKnot Games"
          >
            <img
              src={timeknotLogo}
              alt="TimeKnot Games Logo"
              className="h-16 w-auto"
            />
          </a>
          <a
            href="https://7abcs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            title="7ABCs"
          >
            <img src={sevenAbcsLogo} alt="7ABCs Logo" className="h-16 w-auto" />
          </a>
        </div>

        <div className="text-light/70 text-sm mb-3 text-center">
          Chicken Jockey Scribe Racer v1.4.5 &copy; {currentYear} TimeKnot
          Games. All rights reserved.
        </div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs text-light/70">
          <Link href="/help" className="hover:text-primary">
            About
          </Link>
          <Link href="/privacy" className="hover:text-primary">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-primary">
            Terms
          </Link>

          <Link href="/contact" className="hover:text-primary">
            Contact
          </Link>

          {/* Contact Links */}
          <a
            href="mailto:timeknotgames@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary flex items-center gap-1"
            title="Email us"
          >
            <Mail className="h-3 w-3" />
            <span>Email</span>
          </a>

          <a
            href="https://libraryofmeme.com/cjdisco"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary flex items-center gap-1"
            title="Join our Discord"
          >
            <MessageSquare className="h-3 w-3" />
            <span>Discord</span>
          </a>

          <a
            href="https://x.com/cjsrgame"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary flex items-center gap-1"
            title="Follow us on Twitter/X"
          >
            <Twitter className="h-3 w-3" />
            <span>Twitter</span>
          </a>

          <a
            href="https://libraryofmeme.com/cjfeedback"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            Feedback
          </a>

          <a
            href="https://libme.xyz/cjgift"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary px-2 py-0.5 rounded text-dark hover:brightness-110 font-bold"
          >
            Donate
          </a>
        </div>
      </div>
    </footer>
  );
}

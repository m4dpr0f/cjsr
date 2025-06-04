import { Link } from "wouter";
import { ReactNode } from "react";
import { FaHome, FaGamepad, FaBook, FaUserAlt, FaQuestion, FaDownload } from "react-icons/fa";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-dark flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-dark py-3 border-b border-primary">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/">
            <a className="font-minecraft text-primary text-xl flex items-center">
              <img 
                src="/src/assets/ChickenJockeyLogo.png" 
                alt="CJSR Logo" 
                className="h-10 mr-2" 
              />
              <span className="hidden sm:inline">Chicken Jockey Scribe Racer</span>
              <span className="sm:hidden">CJSR</span>
            </a>
          </Link>
          
          <nav className="flex items-center space-x-1 sm:space-x-3">
            <Link href="/">
              <a className="text-light hover:text-primary px-2 py-1 rounded flex items-center">
                <FaHome className="mr-1" />
                <span className="hidden sm:inline">Home</span>
              </a>
            </Link>
            <Link href="/race">
              <a className="text-light hover:text-primary px-2 py-1 rounded flex items-center">
                <FaGamepad className="mr-1" />
                <span className="hidden sm:inline">Race</span>
              </a>
            </Link>
            <Link href="/campaign">
              <a className="text-light hover:text-primary px-2 py-1 rounded flex items-center">
                <FaBook className="mr-1" />
                <span className="hidden sm:inline">Campaign</span>
              </a>
            </Link>
            <Link href="/profile">
              <a className="text-light hover:text-primary px-2 py-1 rounded flex items-center">
                <FaUserAlt className="mr-1" />
                <span className="hidden sm:inline">Profile</span>
              </a>
            </Link>
            <Link href="/downloads">
              <a className="text-light hover:text-primary px-2 py-1 rounded flex items-center">
                <FaDownload className="mr-1" />
                <span className="hidden sm:inline">Downloads</span>
              </a>
            </Link>
            <Link href="/help">
              <a className="text-light hover:text-primary px-2 py-1 rounded flex items-center">
                <FaQuestion className="mr-1" />
                <span className="hidden sm:inline">Help</span>
              </a>
            </Link>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-dark py-6 border-t border-primary mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0 flex flex-col sm:flex-row items-center">
              <span className="text-light text-sm">© 2025 TimeKnot Games</span>
              <div className="flex mt-2 sm:mt-0 sm:ml-4 space-x-4">
                <Link href="/terms">
                  <a className="text-light hover:text-primary text-sm">Terms</a>
                </Link>
                <Link href="/privacy">
                  <a className="text-light hover:text-primary text-sm">Privacy</a>
                </Link>
                <Link href="/contact">
                  <a className="text-light hover:text-primary text-sm">Contact</a>
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <a 
                href="https://libme.xyz/cjgift" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-light hover:text-primary text-sm flex items-center"
              >
                Support Development
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-soft-teal/20 to-primary/10 border-t border-border/50 rounded-t-3xl mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Made with love */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-primary fill-primary animate-pulse" />
            <span>
              at <span className="font-semibold text-primary">Terrathon</span>,
              by <span className="font-semibold text-primary">DecodeDose</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link
              to="/privacy"
              className="text-muted-foreground hover:text-primary transition-smooth hover:underline"
            >
              Privacy Policy
            </Link>

            <Link
              to="/about"
              className="text-muted-foreground hover:text-primary transition-smooth hover:underline"
            >
              About Team
            </Link>

            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=decodedose@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-smooth hover:underline"
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MedNarrate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
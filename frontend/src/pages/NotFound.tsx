import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero px-4">
      <div className="text-center max-w-md animate-fade-in-up">
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <p className="mb-6 text-2xl text-foreground font-medium">Oops! Page not found</p>
        <p className="mb-8 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button 
          variant="hero" 
          size="lg"
          onClick={() => window.location.href = "/"}
        >
          <Home className="w-5 h-5" />
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

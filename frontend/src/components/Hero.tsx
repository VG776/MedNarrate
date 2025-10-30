import { Button } from "@/components/ui/button";
import medLogo from "@/assets/logoo_med.jpeg";
import bgMed from "@/assets/bg_med.jpeg";

export const Hero = () => {
  const scrollToUpload = () => {
    document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Dynamic animated background */}
      <div className="absolute inset-0 animate-gentle-wave" style={{
        backgroundImage: `url(${bgMed})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.85
      }} />
      
      {/* Soft overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background/40" />
      
      <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in-up">
        {/* Logo - seamlessly blended */}
        <div className="flex justify-center mb-8 animate-scale-in">
          <img 
            src={medLogo} 
            alt="MedNarrate Logo" 
            className="w-80 h-auto drop-shadow-md rounded-xl"
          />
        </div>

        {/* Tagline */}
        <h1 className="text-5xl md:text-6xl font-bold text-deep-blue mb-3 animate-fade-in-up leading-tight" style={{ animationDelay: "0.2s" }}>
          We turn fear into understanding
        </h1>
        <p className="text-2xl md:text-3xl text-deep-blue font-semibold mb-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          One report at a time
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Button 
            variant="hero" 
            size="lg"
            onClick={scrollToUpload}
            className="shadow-glow"
          >
            Upload Report
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={scrollToUpload}
          >
            Try Demo
          </Button>
        </div>
      </div>
    </section>
  );
};

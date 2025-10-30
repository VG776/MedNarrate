import { motion } from "framer-motion";
import Aboutus from "../assets/Aboutus.jpeg";

export default function About() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-soft-teal/20 px-6 py-12">
      
      {/* Animated card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-4xl w-full 
                   bg-white/80 dark:bg-neutral-900/80 
                   backdrop-blur-md rounded-3xl 
                   shadow-2xl border border-border/30 
                   p-10 
                   hover:shadow-[0_0_40px_rgba(79,70,229,0.4)] 
                   transition-shadow duration-300"
      >
        {/* Heading */}
        <h1 className="text-3xl font-bold mb-6 text-primary text-center">
          About DecodeDose
        </h1>

        {/* Text content */}
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-lg">
Meet the Team Behind MedNarrate 💙

At DecodeDose, we believe no one should feel scared reading their own medical report.
That’s why we built MedNarrate — an AI-powered companion that explains your reports in simple, comforting language, helping you feel informed and reassured.
We’re a small team of creators, coders, and storytellers driven by empathy and purpose.
Every word, design, and line of code is made with care — to bring clarity, comfort, and confidence to your healthcare journey.
Built with 💙 by Team DecodeDose,
We’re here to make healthcare communication accessible, caring, and human — one report at a time.💙
        </p>

        {/* Group Picture Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-8 flex justify-center"
        >
          <img
            src={Aboutus}
            alt="Team DecodeDose"
            className="w-full max-w-2xl rounded-2xl shadow-lg border border-border/20 object-cover"
          />
        </motion.div>

        {/* Back to Home button */}
        <div className="mt-8 flex justify-center">
          <a
            href="/"
            className="px-6 py-2 rounded-full bg-primary text-white font-medium hover:bg-primary/80 transition"
          >
            Back to Home
          </a>
        </div>
      </motion.div>
    </div>
  );
}

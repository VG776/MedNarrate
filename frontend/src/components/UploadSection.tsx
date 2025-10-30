// frontend/src/components/UploadSection.tsx
import React, { useEffect, useRef, useState } from "react";
import { Upload, FileText, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Visualization from "./Visualization";

interface Props {
  onFileUpload?: (file: File, language: string) => void;
}

export const UploadSection: React.FC<Props> = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("English");
  const [summary, setSummary] = useState("");
  const [originalSummary, setOriginalSummary] = useState("");
  const [summary2, setSummary2] = useState("");
  const [visualizationData, setVisualizationData] = useState<any[] | null>(null);
  const [visualizationData2, setVisualizationData2] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [analysisFetched, setAnalysisFetched] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [setLanguageActive, setSetLanguageActive] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [originalRecommendations, setOriginalRecommendations] = useState<string[]>([]);
  const [recommendations2, setRecommendations2] = useState<string[]>([]);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [showPrivacyConfirm, setShowPrivacyConfirm] = useState(false);
  const [pendingPrivacyState, setPendingPrivacyState] = useState<boolean | null>(null);
  const progressTimer = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (progressTimer.current) window.clearInterval(progressTimer.current);
    };
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (uploadedFile: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "text/plain"];
    if (!validTypes.includes(uploadedFile.type)) {
      toast({ title: "Invalid file type", description: "Please upload PDF, JPG, PNG, or TXT.", variant: "destructive" });
      return;
    }
    if (uploadedFile.size > 30 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload a file smaller than 30MB.", variant: "destructive" });
      return;
    }
    setFile(uploadedFile);
    toast({ title: "File uploaded", description: `${uploadedFile.name} is ready for analysis.` });
    if (onFileUpload) onFileUpload(uploadedFile, language);
  };

  const handleUploadBoxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const startProgressSimulation = () => {
    setProgressPct(4);
    progressTimer.current = window.setInterval(() => {
      setProgressPct((p) => {
        if (p >= 95) return p;
        return Math.min(95, p + Math.random() * 6);
      });
    }, 400);
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({ title: "No report provided", description: "Please upload a file to analyze.", variant: "destructive" });
      return;
    }
    setLoading(true);
    startProgressSimulation();
    setAnalysisFetched(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);
    formData.append("privacyMode", String(privacyMode));

    // Add auth token if available
    const token = localStorage.getItem("mednarrate_token");
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch("http://localhost:5000/analyze", { 
        method: "POST", 
        body: formData,
        headers
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Analysis failed");
      
      if (progressTimer.current) window.clearInterval(progressTimer.current);
      setProgressPct(100);
      setTimeout(() => setProgressPct(0), 800);

      const analysis = data.analysis;
      const s = analysis.summary || analysis?.summary_en || "No summary available.";
      
      // First set (translatable)
      setSummary(s);
      setOriginalSummary(analysis.summary || s);
      setVisualizationData(analysis.visualization_data || []);
      setRecommendations(analysis.recommendations || []);
      setOriginalRecommendations(analysis.recommendations || []);
      
      // Second set (stays in English)
      setSummary2(s);
      setVisualizationData2(analysis.visualization_data || []);
      setRecommendations2(analysis.recommendations || []);
      
      setAnalysisFetched(true);
      
      // Show save status
      if (data.saved) {
        toast({ 
          title: "Analysis complete & saved", 
          description: "Your report has been saved to history. Scroll down for details." 
        });
      } else {
        toast({ 
          title: "Analysis complete", 
          description: "Scroll down for a friendly summary and visuals." 
        });
      }
    } catch (err: any) {
      if (progressTimer.current) window.clearInterval(progressTimer.current);
      setProgressPct(0);
      toast({ title: "Analysis failed", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleNarrate = () => {
    if (!summary) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const langCode = language === "English" ? "en" :
                     language === "Hindi" ? "hi" :
                     language === "Telugu" ? "te" :
                     language === "Malayalam" ? "ml" :
                     language === "Kannada" ? "kn" :
                     language === "Tamil" ? "ta" : "en";
    const voices = synth.getVoices();
    let voice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(langCode) && /female|frau|woman|feminine|Aditi|Samantha|Karen/i.test(v.name))
                || voices.find(v => v.lang && v.lang.toLowerCase().startsWith(langCode))
                || voices.find(v => v.lang && v.lang.startsWith('en')) || null;

    const combinedLines = [
      ...summary.split("\n").map(l => l.trim()).filter(Boolean),
      "",
      ...(recommendations.length ? ["Suggestions:"] : []),
      ...recommendations.map(r => `• ${r}`)
    ].filter(Boolean);

    combinedLines.forEach((line, idx) => {
      const u = new SpeechSynthesisUtterance(line);
      if (voice) u.voice = voice;
      u.lang = voice?.lang || `${langCode}-IN`;
      u.rate = 0.95;
      u.pitch = 1.03;
      setTimeout(() => window.speechSynthesis.speak(u), idx * 900);
    });
  };

  const handleSetLanguage = async (target: string) => {
    if (!originalSummary && (!originalRecommendations || originalRecommendations.length === 0))
      return toast({ title: "No content", description: "Run analysis first to enable translations.", variant: "destructive" });

    setTranslating(true);
    try {
      const combined = `${originalSummary}\n\n---RECOMMENDATIONS---\n${originalRecommendations.join("\n")}`;
      const resp = await fetch("http://localhost:5000/translate", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: combined, target }),
      });
      const json = await resp.json();
      if (!json.success) throw new Error(json.error || "Translation failed");
      const translated = json.translated || "";
      const parts = translated.split('---RECOMMENDATIONS---');
      const tSummary = parts[0] ? parts[0].trim() : translated.trim();
      const tRecs = parts[1] ? parts[1].trim().split('\n').map(s => s.trim()).filter(Boolean) : [];
      setSummary(tSummary);
      setRecommendations(tRecs);
      setLanguage(target);
      toast({ title: "Language set", description: `Summary and suggestions will now show and narrate in ${target}.` });
      setSetLanguageActive(true);
      setTimeout(() => setSetLanguageActive(false), 1200);
    } catch (err: any) {
      toast({ title: "Translation failed", description: err.message || "Try again", variant: "destructive" });
    } finally {
      setTranslating(false);
    }
  };

  const handlePrivacyToggle = () => {
    setPendingPrivacyState(!privacyMode);
    setShowPrivacyConfirm(true);
  };

  const confirmPrivacyChange = () => {
    if (pendingPrivacyState !== null) {
      setPrivacyMode(pendingPrivacyState);
      toast({ 
        title: pendingPrivacyState ? "Privacy Mode ON" : "Privacy Mode OFF", 
        description: pendingPrivacyState ? "Your data will NOT be stored." : "Your data will be stored securely."
      });
    }
    setShowPrivacyConfirm(false);
    setPendingPrivacyState(null);
  };

  const cancelPrivacyChange = () => {
    setShowPrivacyConfirm(false);
    setPendingPrivacyState(null);
  };

  return (
    <section id="upload" className="min-h-screen gradient-soft flex items-start justify-center px-4 py-12">
      <div className="max-w-4xl w-full mx-auto animate-scale-in">
        <div className="bg-card/95 backdrop-blur-sm rounded-3xl shadow-hover p-8 md:p-12 border-2 border-primary/10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-deep-blue">Upload Your Medical Report</h2>
          <p className="text-center text-foreground/70 mb-6 text-lg">We'll analyze it and explain everything in simple, caring language — in the language you choose.</p>

          {/* Upload box */}
          <div
            className={`relative border-3 border-dashed rounded-3xl p-8 mb-6 transition-all text-center cursor-pointer ${dragActive ? "border-primary bg-primary/10 scale-[1.01] shadow-glow" : "border-primary/30 hover:border-primary/60 hover:bg-primary/5 hover:shadow-soft"}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleUploadBoxClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none"
              accept=".pdf,.jpg,.jpeg,.png,.txt"
              onChange={handleFileInput}
            />
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shadow-soft">
                {file ? <FileText className="w-12 h-12 text-primary" /> : <Upload className="w-12 h-12 text-primary" />}
              </div>

              {file ? (
                <div className="space-y-1">
                  <p className="text-xl font-semibold text-deep-blue">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-2xl font-semibold text-deep-blue">Drop your medical report here</p>
                    <p className="text-lg text-foreground/60">or click to browse</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Supports PDF, JPG, PNG, TXT (max 30MB)</p>
                </>
              )}
            </div>
          </div>

          {/* Analyze button below dropbox */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="flex-1">
              <Button variant="hero" size="lg" className="w-full text-xl py-4 shadow-glow" onClick={handleAnalyze} disabled={!file || loading}>
                {loading ? `Analyzing… ${Math.floor(progressPct)}%` : "Analyze My Report"}
              </Button>
            </div>

            {/* Language selector & set button */}
            <div className="w-full md:w-64 flex gap-2">
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="flex-1 border border-primary/30 rounded-xl px-4 py-2 text-lg bg-white shadow-sm">
                <option>English</option>
                <option>Hindi</option>
                <option>Telugu</option>
                <option>Malayalam</option>
                <option>Kannada</option>
                <option>Tamil</option>
              </select>
              <Button onClick={() => handleSetLanguage(language)} disabled={(!originalSummary && originalRecommendations.length===0) || translating} className={`px-4 py-2 rounded-xl ${setLanguageActive ? 'bg-primary/90' : 'bg-primary'}`}>
                {translating ? "Setting…" : "Set"}
              </Button>
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-center gap-4 bg-primary/5 rounded-2xl p-5 mb-6 border border-primary/10">
            <div className="flex items-center gap-3 flex-1">
              {privacyMode ? <Lock className="w-6 h-6 text-primary flex-shrink-0" /> : <Unlock className="w-6 h-6 text-primary flex-shrink-0" />}
              <p className="text-sm text-foreground/80">
                <span className="font-semibold text-deep-blue">Privacy Mode: {privacyMode ? "ON" : "OFF"}</span>
                <br />
                <span className="text-xs">{privacyMode ? "Your data will NOT be stored" : "Your data will be stored securely"}</span>
              </p>
            </div>
            <button
              onClick={handlePrivacyToggle}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${privacyMode ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${privacyMode ? 'translate-x-9' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Privacy Confirmation Modal */}
          {showPrivacyConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
              <div className="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl animate-scale-in">
                <h3 className="text-2xl font-bold text-deep-blue mb-4">Confirm Privacy Setting</h3>
                <p className="text-gray-700 mb-6">
                  {pendingPrivacyState 
                    ? "Are you sure you want to turn Privacy Mode ON? Your data will NOT be stored after analysis."
                    : "Are you sure you want to turn Privacy Mode OFF? Your data will be stored securely for future reference."}
                </p>
                <div className="flex gap-4">
                  <Button onClick={confirmPrivacyChange} className="flex-1 bg-primary text-white">
                    Confirm
                  </Button>
                  <Button onClick={cancelPrivacyChange} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Progress bar */}
          {loading && (
            <div className="w-full mb-6">
              <div className="h-3 bg-primary/10 rounded-full overflow-hidden">
                <div style={{ width: `${progressPct}%` }} className="h-full bg-primary transition-all"></div>
              </div>
            </div>
          )}

          {/* First Summary Section (Translatable) */}
          {analysisFetched && visualizationData && visualizationData.length > 0 && (
            <>
              <div className="mt-4 flex gap-3 flex-wrap items-center">
                <Button onClick={handleNarrate} className="bg-primary text-white">🔊 Narrate</Button>
              </div>

              {summary && (
                <div className="mt-6 bg-white/90 p-5 rounded-2xl shadow-soft text-lg leading-relaxed text-gray-800">
                  <h3 className="text-2xl font-bold text-deep-blue mb-3">🩵 Summary</h3>
                  <p className="whitespace-pre-line">{summary}</p>
                </div>
              )}

              {recommendations && recommendations.length > 0 && (
                <div className="mt-4 bg-white/90 p-5 rounded-2xl shadow-soft text-lg">
                  <h4 className="text-xl font-semibold text-deep-blue mb-2">✅ Suggestions (Lifestyle)</h4>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    {recommendations.map((r, idx) => (
                      <li key={idx} className="whitespace-pre-line">{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6">
                <Visualization visualizationData={visualizationData} language={language} summary={summary} />
              </div>
            </>
          )}

          {/* Second Summary Section (Always English, Wider) */}
          {analysisFetched && visualizationData2 && visualizationData2.length > 0 && (
            <div className="mt-8">
              {summary2 && (
                <div className="bg-white/90 p-6 rounded-2xl shadow-soft text-lg leading-relaxed text-gray-800">
                  <h3 className="text-2xl font-bold text-deep-blue mb-3">🩵 Detailed Summary (English)</h3>
                  <p className="whitespace-pre-line">{summary2}</p>
                </div>
              )}

              {recommendations2 && recommendations2.length > 0 && (
                <div className="mt-4 bg-white/90 p-6 rounded-2xl shadow-soft text-lg">
                  <h4 className="text-xl font-semibold text-deep-blue mb-2">✅ Detailed Suggestions (English)</h4>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    {recommendations2.map((r, idx) => (
                      <li key={idx} className="whitespace-pre-line">{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6">
                <Visualization visualizationData={visualizationData2} language="English" summary={summary2} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UploadSection;
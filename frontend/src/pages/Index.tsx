import React, { useState } from "react";
import { Hero } from "@/components/Hero";
import UploadSection from "../components/UploadSection";
import { Footer } from "@/components/Footer";
import Visualization from "@/components/Visualization";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom"; // ✅ correct for react-router

const Index = () => {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [privacyMode, setPrivacyMode] = useState<boolean>(true); // track privacy mode
  const navigate = useNavigate(); // ✅ useNavigate for routing

  // Called when file upload completes
  const handleFileUpload = async (file: File, language: string, privacy?: boolean) => {
    if (!file) return;

    setLoading(true);
    setError("");
    setAnalysisResult(null);
    if (privacy !== undefined) setPrivacyMode(privacy);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);
      if (privacy !== undefined) formData.append("privacy", String(privacy));

      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success === false) {
        setError(data.error || "Analysis failed.");
      } else {
        setAnalysisResult(data.analysis);
      }
    } catch (err) {
      console.error(err);
      setError("Server not reachable or invalid response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-blue-100">
      <Hero />
      <UploadSection onFileUpload={handleFileUpload} />

      <div className="container mx-auto px-4 py-6">
        {loading && <p className="text-center text-gray-600 animate-pulse">Analyzing report...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {analysisResult && (
          <div className="mt-6 space-y-6">
            {/* Summary */}
            <div className="bg-white p-6 rounded-xl shadow-md animate-fade-in">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Summary</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                {analysisResult.summary.split("\n").map((line: string, idx: number) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </div>

            {/* Visualization */}
            <Visualization
              visualizationData={analysisResult.visualization_data}
              summary={analysisResult.summary}
            />

            {/* Recommendations */}
            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-md animate-fade-in">
                <h3 className="text-2xl font-bold mb-2 text-deep-blue">💡 Lifestyle Recommendations</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysisResult.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ✅ NEW: Show "View My Health History" button only when privacy mode is OFF */}
            {!privacyMode && (
              <div className="text-center mt-8">
                <Button
                  onClick={() => navigate("/history")}
                  className="bg-primary text-white hover:bg-primary/80 px-6 py-3 rounded-xl shadow-md transition-all"
                >
                  📜 View My Health History
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  View your past uploaded reports and health trends.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Index;

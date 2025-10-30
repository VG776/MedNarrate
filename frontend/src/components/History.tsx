// frontend/src/components/History.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar, FileText, Trash2, Eye, TrendingUp, ChevronRight } from "lucide-react";
import Visualization from "./Visualization";
import TimelineChart from "./TimelineChart";

interface Report {
  _id: string;
  fileName: string;
  language: string;
  uploadDate: string;
  analysis: {
    summary: string;
    recommendations: string[];
    visualization_data: any[];
  };
}

export const History: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("mednarrate_token");
      if (!token) {
        toast({ title: "Not authenticated", description: "Please login first", variant: "destructive" });
        return;
      }

      const res = await fetch("http://localhost:5000/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setReports(data.reports);
    } catch (err: any) {
      toast({ title: "Failed to load reports", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      const token = localStorage.getItem("mednarrate_token");
      const res = await fetch(`http://localhost:5000/reports/${reportId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast({ title: "Report deleted", description: "Successfully removed from history" });
      setReports(reports.filter((r) => r._id !== reportId));
      if (selectedReport?._id === reportId) setSelectedReport(null);
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const viewReport = async (reportId: string) => {
    try {
      const token = localStorage.getItem("mednarrate_token");
      const res = await fetch(`http://localhost:5000/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setSelectedReport(data.report);
      setShowTimeline(false);
    } catch (err: any) {
      toast({ title: "Failed to load report", description: err.message, variant: "destructive" });
    }
  };

  const viewTimeline = (testName: string) => {
    setSelectedTest(testName);
    setShowTimeline(true);
    setSelectedReport(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-deep-blue font-semibold text-lg">Loading your reports...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen gradient-soft px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 animate-scale-in">
          <h1 className="text-4xl md:text-5xl font-bold text-deep-blue mb-3">Your Health History</h1>
          <p className="text-foreground/70 text-lg">Track your medical reports and health trends over time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-1">
            <div className="bg-card/95 backdrop-blur-sm rounded-3xl shadow-hover p-6 border-2 border-primary/10 animate-scale-in">
              <h2 className="text-2xl font-bold text-deep-blue mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Saved Reports ({reports.length})
              </h2>

              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-primary/30 mx-auto mb-3" />
                  <p className="text-foreground/60">No reports saved yet</p>
                  <p className="text-sm text-foreground/40 mt-2">Upload a report with Privacy Mode OFF to save it</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {reports.map((report) => (
                    <div
                      key={report._id}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        selectedReport?._id === report._id
                          ? "bg-primary/10 border-primary shadow-soft"
                          : "bg-white/90 border-primary/20 hover:border-primary/40 hover:shadow-soft"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0" onClick={() => viewReport(report._id)}>
                          <h3 className="font-semibold text-deep-blue truncate">{report.fileName}</h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-foreground/60">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(report.uploadDate)}</span>
                          </div>
                          <span className="inline-block mt-2 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                            {report.language}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => viewReport(report._id)}
                            className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                            title="View Report"
                          >
                            <Eye className="w-4 h-4 text-primary" />
                          </button>
                          <button
                            onClick={() => deleteReport(report._id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Report Details / Timeline */}
          <div className="lg:col-span-2">
            {!selectedReport && !showTimeline ? (
              <div className="bg-card/95 backdrop-blur-sm rounded-3xl shadow-hover p-12 border-2 border-primary/10 animate-scale-in text-center">
                <TrendingUp className="w-20 h-20 text-primary/30 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-deep-blue mb-2">Select a Report</h3>
                <p className="text-foreground/60">Choose a report from the list to view details and trends</p>
              </div>
            ) : showTimeline ? (
              <div className="bg-card/95 backdrop-blur-sm rounded-3xl shadow-hover p-6 md:p-8 border-2 border-primary/10 animate-scale-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-deep-blue flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    Timeline: {selectedTest}
                  </h2>
                  <Button onClick={() => setShowTimeline(false)} variant="outline">
                    Back to Report
                  </Button>
                </div>
                <TimelineChart testName={selectedTest} />
              </div>
            ) : selectedReport ? (
              <div className="bg-card/95 backdrop-blur-sm rounded-3xl shadow-hover p-6 md:p-8 border-2 border-primary/10 animate-scale-in">
                {/* Report Header */}
                <div className="mb-6 pb-6 border-b-2 border-primary/10">
                  <h2 className="text-3xl font-bold text-deep-blue mb-2">{selectedReport.fileName}</h2>
                  <div className="flex items-center gap-4 text-sm text-foreground/60">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedReport.uploadDate)}
                    </div>
                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full font-semibold">
                      {selectedReport.language}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                {selectedReport.analysis.summary && (
                  <div className="mb-6 bg-white/90 p-5 rounded-2xl shadow-soft">
                    <h3 className="text-xl font-bold text-deep-blue mb-3">🩵 Summary</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {selectedReport.analysis.summary}
                    </p>
                  </div>
                )}

                {/* Recommendations */}
                {selectedReport.analysis.recommendations && selectedReport.analysis.recommendations.length > 0 && (
                  <div className="mb-6 bg-white/90 p-5 rounded-2xl shadow-soft">
                    <h3 className="text-xl font-bold text-deep-blue mb-3">✅ Recommendations</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      {selectedReport.analysis.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Visualization */}
                {selectedReport.analysis.visualization_data && (
                  <>
                    <Visualization
                      visualizationData={selectedReport.analysis.visualization_data}
                      language={selectedReport.language}
                      summary={selectedReport.analysis.summary}
                    />

                    {/* Timeline Buttons */}
                    <div className="mt-6 bg-primary/5 p-5 rounded-2xl border border-primary/10">
                      <h3 className="text-lg font-bold text-deep-blue mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        View Trends Over Time
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.analysis.visualization_data.map((test, idx) => (
                          <button
                            key={idx}
                            onClick={() => viewTimeline(test.test)}
                            className="px-4 py-2 bg-white hover:bg-primary/10 border-2 border-primary/30 hover:border-primary rounded-xl transition-all flex items-center gap-2 text-sm font-semibold text-deep-blue"
                          >
                            {test.emoji} {test.test}
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default History;
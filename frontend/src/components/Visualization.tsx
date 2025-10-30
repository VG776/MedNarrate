// frontend/src/components/Visualization.tsx
import React, { useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface VisualizationProps {
  visualizationData: any[];
  language?: string;
  summary?: string;
}

const Visualization: React.FC<VisualizationProps> = ({ visualizationData, language = 'English', summary = '' }) => {
  const chartRef = useRef<any>(null);

  if (!visualizationData || visualizationData.length === 0)
    return <p className="text-center text-gray-600 mt-4">No visualization available</p>;

  // ---- Per-test mini boxes (each has its own scale) ----
  const renderTestCard = (t: any, i: number) => {
    const value = typeof t.value_numeric === 'number' ? t.value_numeric : null;
    const low = typeof t.normal_low === 'number' ? t.normal_low : null;
    const high = typeof t.normal_high === 'number' ? t.normal_high : null;
    const unit = t.unit || '';
    const flag = t.flag || 'unknown';
    const emoji = t.emoji || '';

    // Determine a display scale per test so bars are comparable visually per-card
    // If normal range exists, use padding around it; else, base on value
    let minScale = 0;
    let maxScale = 100;
    if (low != null && high != null && high > low) {
      const range = high - low;
      minScale = Math.max(0, Math.floor(low - range * 0.6));
      maxScale = Math.ceil(high + range * 0.6);
    } else if (value != null) {
      minScale = Math.max(0, Math.floor(value * 0.1));
      maxScale = Math.ceil(value * 2);
    } else {
      minScale = 0;
      maxScale = 100;
    }
    // Avoid zero-range
    if (maxScale <= minScale) maxScale = minScale + 1;

    // compute percentage
    const percent = value != null ? Math.round(((value - minScale) / (maxScale - minScale)) * 100) : 0;
    const safePercent = Math.max(0, Math.min(100, percent));

    const color = flag === 'normal' ? '#A5D6A7' : flag === 'borderline' ? '#FFD54F' : '#EF5350';

    return (
      <div key={i} className="bg-white/95 p-4 rounded-2xl shadow-md flex-1 min-w-[220px] max-w-[320px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{emoji}</span>
              <h4 className="text-lg font-semibold text-deep-blue">{t.test}</h4>
            </div>
            <p className="text-sm text-gray-600 mt-1">{t.value_numeric != null ? `${t.value_numeric} ${unit}` : t.value_text || '—'}</p>
            <p className="text-xs text-muted-foreground mt-2">Normal: {low ?? '?'} – {high ?? '?' } {unit}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold" style={{ color }}>{flag?.toUpperCase()}</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div style={{ width: `${safePercent}%`, background: color }} className="h-full transition-all"></div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <span>{minScale}{unit ? ` ${unit}` : ''}</span>
            <span>{Math.round((maxScale+minScale)/2)}{unit ? ` ${unit}` : ''}</span>
            <span>{maxScale}{unit ? ` ${unit}` : ''}</span>
          </div>
        </div>
      </div>
    );
  };

  // Also show a concise stacked bar chart for quick glance (scaled to each test's value but not using a shared axis)
  // For the compact chart we map values to normalized 0-100 (so chart is visible)
  const chartLabels = visualizationData.map((t) => {
    const short = t.test.length > 18 ? t.test.slice(0, 16) + '…' : t.test;
    return `${t.emoji ? t.emoji + ' ' : ''}${short}`;
  });
  const chartValues = visualizationData.map((t) => {
    const v = typeof t.value_numeric === 'number' ? t.value_numeric : 0;
    // normalize using its own range like in cards so all bars visible in chart too
    const low = typeof t.normal_low === 'number' ? t.normal_low : 0;
    const high = typeof t.normal_high === 'number' ? t.normal_high : v || 100;
    let minScale = 0;
    let maxScale = 100;
    if (low != null && high != null && high > low) {
      const range = high - low;
      minScale = Math.max(0, Math.floor(low - range * 0.6));
      maxScale = Math.ceil(high + range * 0.6);
    } else if (v != null) {
      minScale = Math.max(0, Math.floor(v * 0.1));
      maxScale = Math.ceil(v * 2);
    } else {
      minScale = 0;
      maxScale = 100;
    }
    if (maxScale <= minScale) maxScale = minScale + 1;
    const percent = Math.round(((v - minScale) / (maxScale - minScale)) * 100);
    return Math.max(0, Math.min(100, percent));
  });
  const chartColors = visualizationData.map((t) => (t.flag === 'normal' ? '#A5D6A7' : t.flag === 'borderline' ? '#FFD54F' : '#EF5350'));

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Relative value (per-test scale)",
        data: chartValues,
        backgroundColor: chartColors,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions: any = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const idx = context.dataIndex;
            const t = visualizationData[idx];
            return `${t.test}: ${t.value_numeric ?? t.value_text ?? '—'} ${t.unit ?? ''} (Normal: ${t.normal_low ?? '?'} - ${t.normal_high ?? '?'})`;
          }
        }
      },
      title: {
        display: true,
        text: "📊 Overview (per-test scaled)",
        font: { size: 16 },
      }
    },
    scales: {
      x: { display: false },
      y: {
        ticks: { autoSkip: false },
      }
    }
  };

  const handleNarrate = () => {
    if (!summary) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const langCode = language === "English"
      ? "en" : language === "Hindi"
      ? "hi" : language === "Telugu"
      ? "te" : language === "Malayalam"
      ? "ml" : language === "Kannada"
      ? "kn" : language === "Tamil"
      ? "ta" : "en";

    const voices = synth.getVoices();
    let voice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(langCode));
    if (!voice) voice = voices.find(v => v.lang && v.lang.startsWith('en')) || null;

    const lines = summary.split('\n').map(s => s.trim()).filter(Boolean);
    lines.forEach((line, idx) => {
      const u = new SpeechSynthesisUtterance(line);
      if (voice) u.voice = voice;
      u.lang = voice?.lang || `${langCode}-IN`;
      u.rate = 0.95;
      u.pitch = 1.02;
      setTimeout(() => synth.speak(u), idx * 850);
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-6 animate-scale-in">
      <h2 className="text-2xl font-semibold mb-4 text-deep-blue">Visual Summary</h2>

      {/* Per-test cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visualizationData.map((t, i) => renderTestCard(t, i))}
      </div>

      {/* Compact overview chart */}
      <div className="mt-6 bg-slate-50 p-4 rounded-xl">
        <div style={{ height: 280 }}>
          <Bar ref={chartRef} data={chartData} options={chartOptions} />
        </div>
      </div>

      {summary && (
        <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-lg font-medium text-gray-700 whitespace-pre-line">{summary}</p>
          <button onClick={handleNarrate} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 flex items-center gap-2">
            🔊 Narrate
          </button>
        </div>
      )}

      <div className="mt-6 flex gap-4 justify-center">
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-green-500 rounded-full"></span> Normal</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-yellow-400 rounded-full"></span> Borderline</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-red-500 rounded-full"></span> Out of Range</span>
      </div>
    </div>
  );
};

export default Visualization;
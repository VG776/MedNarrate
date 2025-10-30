// frontend/src/components/TimelineChart.tsx
import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface TimelineData {
  date: string;
  value: number | null;
  unit: string;
  flag: string;
  normalLow: number | null;
  normalHigh: number | null;
}

interface TimelineChartProps {
  testName: string;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ testName }) => {
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTimelineData();
  }, [testName]);

  const fetchTimelineData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("mednarrate_token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`http://localhost:5000/timeline/${encodeURIComponent(testName)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setTimelineData(data.data);
    } catch (err: any) {
      toast({ title: "Failed to load timeline", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-deep-blue font-semibold">Loading timeline...</p>
        </div>
      </div>
    );
  }

  if (timelineData.length === 0) {
    return (
      <div className="text-center py-12 bg-white/90 rounded-2xl">
        <TrendingUp className="w-16 h-16 text-primary/30 mx-auto mb-3" />
        <p className="text-foreground/60 text-lg">No historical data available for this test</p>
        <p className="text-sm text-foreground/40 mt-2">Upload more reports to see trends over time</p>
      </div>
    );
  }

  // Prepare chart data
  const labels = timelineData.map((d) =>
    new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  );
  const values = timelineData.map((d) => d.value);
  const normalLow = timelineData[0]?.normalLow;
  const normalHigh = timelineData[0]?.normalHigh;
  const unit = timelineData[0]?.unit || "";

  // Calculate trend
  const firstValue = timelineData[0]?.value;
  const lastValue = timelineData[timelineData.length - 1]?.value;
  const trend =
    firstValue && lastValue
      ? lastValue > firstValue
        ? "up"
        : lastValue < firstValue
        ? "down"
        : "stable"
      : "stable";
  const trendPercent =
    firstValue && lastValue ? (((lastValue - firstValue) / firstValue) * 100).toFixed(1) : "0";

  const chartData = {
    labels,
    datasets: [
      {
        label: testName,
        data: values,
        borderColor: "#5A9BD4",
        backgroundColor: "rgba(90, 155, 212, 0.1)",
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: values.map((_, idx) => {
          const flag = timelineData[idx]?.flag;
          return flag === "normal" ? "#A5D6A7" : flag === "borderline" ? "#FFD54F" : "#EF5350";
        }),
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      ...(normalLow != null
        ? [
            {
              label: "Normal Low",
              data: labels.map(() => normalLow),
              borderColor: "#A5D6A7",
              backgroundColor: "transparent",
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0,
              tension: 0,
            },
          ]
        : []),
      ...(normalHigh != null
        ? [
            {
              label: "Normal High",
              data: labels.map(() => normalHigh),
              borderColor: "#EF5350",
              backgroundColor: "transparent",
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0,
              tension: 0,
            },
          ]
        : []),
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, weight: "600" },
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#2B5C7F",
        bodyColor: "#2B5C7F",
        borderColor: "#5A9BD4",
        borderWidth: 2,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            const idx = context.dataIndex;
            const d = timelineData[idx];
            return `${context.dataset.label}: ${context.parsed.y} ${unit} (${d.flag})`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function (value: any) {
            return `${value} ${unit}`;
          },
          font: { size: 11 },
        },
        grid: {
          color: "rgba(90, 155, 212, 0.1)",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11 },
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/90 p-5 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground/60">Latest Value</span>
            {trend === "up" ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : trend === "down" ? (
              <TrendingDown className="w-5 h-5 text-red-500" />
            ) : (
              <Minus className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <p className="text-2xl font-bold text-deep-blue">
            {lastValue} {unit}
          </p>
          <p className="text-xs text-foreground/50 mt-1">
            {new Date(timelineData[timelineData.length - 1].date).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white/90 p-5 rounded-2xl shadow-soft">
          <span className="text-sm font-semibold text-foreground/60 block mb-2">Trend</span>
          <p className={`text-2xl font-bold ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500"}`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {Math.abs(Number(trendPercent))}%
          </p>
          <p className="text-xs text-foreground/50 mt-1">
            {trend === "up" ? "Increasing" : trend === "down" ? "Decreasing" : "Stable"}
          </p>
        </div>

        <div className="bg-white/90 p-5 rounded-2xl shadow-soft">
          <span className="text-sm font-semibold text-foreground/60 block mb-2">Total Reports</span>
          <p className="text-2xl font-bold text-deep-blue">{timelineData.length}</p>
          <p className="text-xs text-foreground/50 mt-1">Data points tracked</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white/90 p-6 rounded-2xl shadow-soft">
        <h3 className="text-xl font-bold text-deep-blue mb-4">Timeline Graph</h3>
        <div style={{ height: 400 }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white/90 p-6 rounded-2xl shadow-soft">
        <h3 className="text-xl font-bold text-deep-blue mb-4">Historical Data</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-primary/20">
                <th className="text-left py-3 px-4 text-sm font-semibold text-deep-blue">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-deep-blue">Value</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-deep-blue">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-deep-blue">Normal Range</th>
              </tr>
            </thead>
            <tbody>
              {timelineData.map((d, idx) => (
                <tr key={idx} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {new Date(d.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-deep-blue">
                    {d.value} {d.unit}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        d.flag === "normal"
                          ? "bg-green-100 text-green-700"
                          : d.flag === "borderline"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {d.flag.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {d.normalLow ?? "?"} - {d.normalHigh ?? "?"} {d.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimelineChart;
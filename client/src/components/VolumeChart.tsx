import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  Filler,
} from "chart.js";
import { WorkoutSession, DateRange } from "../types";
import { useState, useMemo } from "react";
import { normalizeVolume, convertWeight } from "../utils/volumeCalculation";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface VolumeChartProps {
  workouts: WorkoutSession[];
  dateRange: DateRange;
  unit: "kg" | "lb";
}

type ChartType = "line" | "bar";

interface Stats {
  totalVolume: number;
  averageVolume: number;
  maxVolume: number;
  volumeChange: number;
}

const VolumeChart = ({ workouts, dateRange, unit }: VolumeChartProps) => {
  const [chartType, setChartType] = useState<ChartType>("line");
  const [showStats, setShowStats] = useState(true);

  // Sort workouts by date
  const sortedWorkouts = useMemo(
    () =>
      [...workouts].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    [workouts]
  );

  // Get date range limits
  const getDateRangeLimit = (): Date => {
    const now = new Date();
    switch (dateRange) {
      case "week":
        return new Date(now.setDate(now.getDate() - 7));
      case "month":
        return new Date(now.setMonth(now.getMonth() - 1));
      case "year":
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(0); // Show all data for custom range
    }
  };

  // Filter workouts by date range
  const filteredWorkouts = useMemo(
    () =>
      sortedWorkouts.filter(
        (workout) => new Date(workout.date) >= getDateRangeLimit()
      ),
    [sortedWorkouts, dateRange]
  );

  // Calculate statistics with proper volume handling
  const stats: Stats = useMemo(() => {
    if (filteredWorkouts.length === 0) {
      return {
        totalVolume: 0,
        averageVolume: 0,
        maxVolume: 0,
        volumeChange: 0,
      };
    }

    try {
      // Normalize volumes and convert to target unit if needed
      const volumes = filteredWorkouts.map((workout) => {
        const normalizedVolume = normalizeVolume(workout.totalVolume);
        return workout.unit === unit
          ? normalizedVolume
          : convertWeight(normalizedVolume, workout.unit, unit);
      });

      const total = volumes.reduce((sum, vol) => sum + vol, 0);
      const max = Math.max(...volumes);
      const avg = total / volumes.length;

      // Calculate volume change (comparing last workout to first workout)
      const firstVolume = volumes[0] || 0;
      const lastVolume = volumes[volumes.length - 1] || 0;
      const change =
        firstVolume === 0
          ? 0
          : ((lastVolume - firstVolume) / firstVolume) * 100;

      return {
        totalVolume: Number(total.toFixed(2)),
        averageVolume: Number(avg.toFixed(2)),
        maxVolume: Number(max.toFixed(2)),
        volumeChange: Number(change.toFixed(1)),
      };
    } catch (error) {
      console.error("Error calculating stats:", error);
      return {
        totalVolume: 0,
        averageVolume: 0,
        maxVolume: 0,
        volumeChange: 0,
      };
    }
  }, [filteredWorkouts, unit]);

  // Prepare base chart data with proper volume handling
  const baseDataset = {
    label: `Volume (${unit})`,
    data: filteredWorkouts.map((workout) => {
      try {
        const normalizedVolume = normalizeVolume(workout.totalVolume);
        return workout.unit === unit
          ? normalizedVolume
          : convertWeight(normalizedVolume, workout.unit, unit);
      } catch (error) {
        console.error("Error processing volume:", error);
        return 0;
      }
    }),
    borderColor: "#e8772e",
  };

  // Prepare line chart data
  const lineChartData: ChartData<"line"> = {
    labels: filteredWorkouts.map((workout) =>
      new Date(workout.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        ...baseDataset,
        backgroundColor: "rgba(232, 119, 46, 0.1)",
        tension: 0.1,
        fill: true,
      },
    ],
  };

  // Prepare bar chart data
  const barChartData: ChartData<"bar"> = {
    labels: filteredWorkouts.map((workout) =>
      new Date(workout.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        ...baseDataset,
        backgroundColor: "#e8772e",
      },
    ],
  };

  // Chart options
  const options: ChartOptions<"line" | "bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#001f3f", // Secondary color from design
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#e8772e",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => {
            return `Volume: ${context.parsed.y.toFixed(1)} ${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#666",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#666",
        },
      },
    },
  };

  return (
    <div className="w-full space-y-4">
      {/* Chart Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType("line")}
            className={`px-4 py-2 font-bold ${
              chartType === "line"
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            } transition-colors`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`px-4 py-2 font-bold ${
              chartType === "bar"
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            } transition-colors`}
          >
            Bar
          </button>
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="px-4 py-2 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {showStats ? "Hide Stats" : "Show Stats"}
        </button>
      </div>

      {/* Stats Display */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Volume
            </div>
            <div className="text-xl font-bold">
              {stats.totalVolume.toFixed(2)} {unit}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Average Volume
            </div>
            <div className="text-xl font-bold">
              {stats.averageVolume.toFixed(2)} {unit}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Max Volume
            </div>
            <div className="text-xl font-bold">
              {stats.maxVolume.toFixed(2)} {unit}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Progress
            </div>
            <div
              className={`text-xl font-bold ${
                stats.volumeChange > 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {stats.volumeChange > 0 ? "+" : ""}
              {stats.volumeChange.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="w-full h-[400px] bg-white dark:bg-gray-800 rounded-lg p-4">
        {chartType === "line" ? (
          <Line data={lineChartData} options={options} />
        ) : (
          <Bar data={barChartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default VolumeChart;

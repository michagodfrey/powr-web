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
  ChartData,
} from "chart.js";
import { WorkoutSession, DateRange } from "../types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface VolumeChartProps {
  workouts: WorkoutSession[];
  dateRange: DateRange;
  unit: "kg" | "lb";
}

const VolumeChart = ({ workouts, dateRange, unit }: VolumeChartProps) => {
  // Sort workouts by date
  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
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
  const filteredWorkouts = sortedWorkouts.filter(
    (workout) => new Date(workout.date) >= getDateRangeLimit()
  );

  // Prepare data for the chart
  const chartData: ChartData<"line"> = {
    labels: filteredWorkouts.map((workout) =>
      new Date(workout.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        label: `Volume (${unit})`,
        data: filteredWorkouts.map((workout) => workout.totalVolume),
        borderColor: "#e8772e", // Primary color from design
        backgroundColor: "rgba(232, 119, 46, 0.1)",
        tension: 0.1,
        fill: true,
      },
    ],
  };

  // Chart options
  const options = {
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
          label: (context: any) => {
            return `Volume: ${context.parsed.y} ${unit}`;
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
    <div className="w-full h-[400px] bg-white dark:bg-gray-800 rounded-lg p-4">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default VolumeChart;

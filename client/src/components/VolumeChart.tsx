// Interactive chart component for visualizing workout volume over time
// Supports line/bar views and provides statistical analysis of progress
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
import { WorkoutSession, DateRangeState } from "../types";
import { useState, useMemo } from "react";
import { normalizeVolume, convertWeight } from "../utils/volumeCalculation";
import { Slider } from "@mui/material";
import { styled } from "@mui/material/styles";

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
  unit: "kg" | "lb";
}

type ChartType = "line" | "bar";

interface Stats {
  totalVolume: number;
  averageVolume: number;
  maxVolume: number;
  maxVolumeDate: Date | null;
  volumeChange: number;
  daysTrained: number;
  daysInRange: number;
}

// Styled slider component
const CustomSlider = styled(Slider)(() => ({
  color: "#e8772e",
  height: 3,
  "& .MuiSlider-thumb": {
    height: 14,
    width: 14,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "inherit",
    },
  },
  "& .MuiSlider-valueLabel": {
    lineHeight: 1.2,
    fontSize: 12,
    background: "unset",
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: "50% 50% 50% 0",
    backgroundColor: "#e8772e",
    transformOrigin: "bottom left",
    transform: "translate(50%, -100%) rotate(-45deg) scale(0)",
    "&:before": { display: "none" },
    "&.MuiSlider-valueLabelOpen": {
      transform: "translate(50%, -100%) rotate(-45deg) scale(1)",
    },
    "& > *": {
      transform: "rotate(45deg)",
    },
  },
}));

const VolumeChart = ({ workouts, unit }: VolumeChartProps) => {
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

  // Get date range for slider
  const { minDate, maxDate, dateRange } = useMemo(() => {
    if (sortedWorkouts.length === 0) {
      const now = new Date();
      return {
        minDate: now,
        maxDate: now,
        dateRange: { startDate: now, endDate: now },
      };
    }

    const min = new Date(sortedWorkouts[0].date);
    const max = new Date(sortedWorkouts[sortedWorkouts.length - 1].date);
    return {
      minDate: min,
      maxDate: max,
      dateRange: { startDate: min, endDate: max },
    };
  }, [sortedWorkouts]);

  // State for date range
  const [selectedDateRange, setSelectedDateRange] =
    useState<DateRangeState>(dateRange);

  // Convert dates to slider values (0-100)
  const dateToSliderValue = (date: Date) => {
    const total = maxDate.getTime() - minDate.getTime();
    const current = date.getTime() - minDate.getTime();
    return (current / total) * 100;
  };

  // Convert slider values (0-100) to dates
  const sliderValueToDate = (value: number) => {
    const total = maxDate.getTime() - minDate.getTime();
    const time = (value / 100) * total + minDate.getTime();
    return new Date(time);
  };

  // Handle slider change
  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setSelectedDateRange({
        startDate: sliderValueToDate(newValue[0]),
        endDate: sliderValueToDate(newValue[1]),
      });
    }
  };

  // Filter workouts by selected date range
  const filteredWorkouts = useMemo(
    () =>
      sortedWorkouts.filter((workout) => {
        const workoutDate = new Date(workout.date);
        return (
          workoutDate >= selectedDateRange.startDate &&
          workoutDate <= selectedDateRange.endDate
        );
      }),
    [sortedWorkouts, selectedDateRange]
  );

  // Calculate statistics with proper volume handling
  const stats: Stats = useMemo(() => {
    if (filteredWorkouts.length === 0) {
      return {
        totalVolume: 0,
        averageVolume: 0,
        maxVolume: 0,
        maxVolumeDate: null,
        volumeChange: 0,
        daysTrained: 0,
        daysInRange: 0,
      };
    }

    try {
      // Normalize volumes and convert to target unit if needed
      const volumes = filteredWorkouts.map((workout) => {
        const normalizedVolume = normalizeVolume(workout.totalVolume);
        return {
          volume:
            workout.unit === unit
              ? normalizedVolume
              : convertWeight(normalizedVolume, workout.unit, unit),
          date: new Date(workout.date),
        };
      });

      const total = volumes.reduce((sum, { volume }) => sum + volume, 0);
      const maxVolumeEntry = volumes.reduce(
        (max, current) => (current.volume > max.volume ? current : max),
        volumes[0]
      );
      const avg = total / volumes.length;

      // Calculate volume change (comparing last workout to first workout)
      const firstVolume = volumes[0].volume || 0;
      const lastVolume = volumes[volumes.length - 1].volume || 0;
      const change =
        firstVolume === 0
          ? 0
          : ((lastVolume - firstVolume) / firstVolume) * 100;

      // Calculate days trained and days in range
      const uniqueDays = new Set(
        filteredWorkouts.map((w) => new Date(w.date).toDateString())
      ).size;
      const msInDay = 1000 * 60 * 60 * 24;
      const daysInRange =
        Math.ceil(
          (selectedDateRange.endDate.getTime() -
            selectedDateRange.startDate.getTime()) /
            msInDay
        ) + 1;

      return {
        totalVolume: Number(total.toFixed(2)),
        averageVolume: Number(avg.toFixed(2)),
        maxVolume: Number(maxVolumeEntry.volume.toFixed(2)),
        maxVolumeDate: maxVolumeEntry.date,
        volumeChange: Number(change.toFixed(1)),
        daysTrained: uniqueDays,
        daysInRange: daysInRange,
      };
    } catch (error) {
      console.error("Error calculating stats:", error);
      return {
        totalVolume: 0,
        averageVolume: 0,
        maxVolume: 0,
        maxVolumeDate: null,
        volumeChange: 0,
        daysTrained: 0,
        daysInRange: 0,
      };
    }
  }, [filteredWorkouts, unit, selectedDateRange]);

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
    labels: filteredWorkouts.map((workout) => {
      const date = new Date(workout.date);
      const firstDate = new Date(filteredWorkouts[0].date);
      const lastDate = new Date(
        filteredWorkouts[filteredWorkouts.length - 1].date
      );
      const spanMoreThanYear =
        lastDate.getFullYear() - firstDate.getFullYear() > 0;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(spanMoreThanYear && { year: "2-digit" }),
      });
    }),
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
    labels: filteredWorkouts.map((workout) => {
      const date = new Date(workout.date);
      const firstDate = new Date(filteredWorkouts[0].date);
      const lastDate = new Date(
        filteredWorkouts[filteredWorkouts.length - 1].date
      );
      const spanMoreThanYear =
        lastDate.getFullYear() - firstDate.getFullYear() > 0;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(spanMoreThanYear && { year: "2-digit" }),
      });
    }),
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

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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

      {/* Date Range Slider */}
      <div className="px-4 py-6 bg-white dark:bg-gray-800 rounded-lg">
        <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{formatDate(selectedDateRange.startDate)}</span>
          <span>{formatDate(selectedDateRange.endDate)}</span>
        </div>
        <CustomSlider
          value={[
            dateToSliderValue(selectedDateRange.startDate),
            dateToSliderValue(selectedDateRange.endDate),
          ]}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => formatDate(sliderValueToDate(value))}
        />
      </div>

      {/* Stats Display */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
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
            {stats.maxVolumeDate && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.maxVolumeDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "2-digit",
                })}
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Days Trained
            </div>
            <div className="text-xl font-bold">
              {stats.daysTrained}
              {stats.daysInRange > 7 && (
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  /{stats.daysInRange}
                </span>
              )}
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

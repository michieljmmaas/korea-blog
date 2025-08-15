import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Type definitions
interface StatsData {
  kimbap: number;
  commits: number;
  cultural: number;
  steps: number;
  worked: number;
}

interface DayData {
  date: string;
  kimbap: number;
  commits: number;
  cultural: number;
  steps: number;
  worked: number;
}

interface BlogStatsData {
  daily: DayData[];
  arrays: {
    dates: string[];
    kimbap: number[];
    commits: number[];
    cultural: number[];
    steps: number[];
    worked: number[];
  };
  dailyTotals: Array<{
    date: string;
    total: number;
  }>;
  cumulative: DayData[];
  summary: {
    totalDays: number;
    dateRange: {
      start: string;
      end: string;
    };
    totals: StatsData;
    averages: {
      kimbap: string;
      commits: string;
      cultural: string;
      steps: number;
      worked: string;
    };
  };
}

interface VacationStatsChartProps {
  weekNumber?: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
  }>;
  label?: string;
}

interface StatConfig {
  key: keyof StatsData;
  label: string;
  color: string;
  icon: string;
}

const VacationStatsChart: React.FC<VacationStatsChartProps> = ({ weekNumber = 1 }) => {
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [displayData, setDisplayData] = useState<DayData[]>([]);
  const [showFullData, setShowFullData] = useState<boolean>(false);
  const [currentWeek, setCurrentWeek] = useState<number>(weekNumber);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load the JSON data
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        const response = await fetch('/blog-stats.json');
        if (!response.ok) {
          throw new Error('Failed to load stats data');
        }
        const data: BlogStatsData = await response.json();
        
        // Use cumulative data for the "total so far" view
        setChartData(data.cumulative || []);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update display data based on week selection or full view
  useEffect(() => {
    if (chartData.length === 0) return;

    if (showFullData) {
      setDisplayData(chartData);
    } else {
      // Calculate week window (7 days per week)
      const startIndex = Math.max(0, (currentWeek - 1) * 7);
      const endIndex = Math.min(chartData.length, currentWeek * 7);
      setDisplayData(chartData.slice(startIndex, endIndex));
    }
  }, [chartData, currentWeek, showFullData]);

  // Toggle between week view and full view
  const toggleView = (): void => {
    setShowFullData(!showFullData);
  };

  // Format date for display (show only day/month)
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Custom tooltip
  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`Date: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-gray-500">Loading vacation stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-red-50 rounded-lg">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const maxWeek = Math.ceil(chartData.length / 7);

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Vacation Stats - Cumulative Progress
        </h2>
        
        <div className="flex items-center gap-4">
          {/* Week selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Week:</label>
            <input
              type="number"
              min="1"
              max={maxWeek}
              value={currentWeek}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setCurrentWeek(Math.max(1, Math.min(maxWeek, parseInt(e.target.value) || 1)))
              }
              disabled={showFullData}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded disabled:bg-gray-100 disabled:text-gray-500"
            />
            <span className="text-sm text-gray-500">/ {maxWeek}</span>
          </div>
          
          {/* Toggle button */}
          <button
            onClick={toggleView}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {showFullData ? 'Show Week View' : 'Show All Data'}
          </button>
        </div>
      </div>

      {/* Chart info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {showFullData 
            ? `Showing all ${chartData.length} days` 
            : `Week ${currentWeek}: Days ${Math.max(0, (currentWeek - 1) * 7) + 1}-${Math.min(chartData.length, currentWeek * 7)}`
          }
        </span>
        <span>
          {displayData.length > 0 && (
            `${formatDate(displayData[0]?.date)} - ${formatDate(displayData[displayData.length - 1]?.date)}`
          )}
        </span>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="#666"
              fontSize={12}
            />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Lines for each stat */}
            <Line 
              type="monotone" 
              dataKey="kimbap" 
              stroke="#ff6b6b" 
              strokeWidth={2}
              dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 4 }}
              name="Kimbap"
            />
            <Line 
              type="monotone" 
              dataKey="commits" 
              stroke="#4ecdc4" 
              strokeWidth={2}
              dot={{ fill: '#4ecdc4', strokeWidth: 2, r: 4 }}
              name="Commits"
            />
            <Line 
              type="monotone" 
              dataKey="cultural" 
              stroke="#45b7d1" 
              strokeWidth={2}
              dot={{ fill: '#45b7d1', strokeWidth: 2, r: 4 }}
              name="Cultural"
            />
            <Line 
              type="monotone" 
              dataKey="worked" 
              stroke="#f9ca24" 
              strokeWidth={2}
              dot={{ fill: '#f9ca24', strokeWidth: 2, r: 4 }}
              name="Worked"
            />
            <Line 
              type="monotone" 
              dataKey="steps" 
              stroke="#6c5ce7" 
              strokeWidth={2}
              dot={{ fill: '#6c5ce7', strokeWidth: 2, r: 4 }}
              name="Steps"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats summary */}
      {displayData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {([
            { key: 'kimbap', label: 'Kimbap', color: 'bg-red-100 text-red-800', icon: '🍙' },
            { key: 'commits', label: 'Commits', color: 'bg-teal-100 text-teal-800', icon: '💻' },
            { key: 'cultural', label: 'Cultural', color: 'bg-blue-100 text-blue-800', icon: '🏛️' },
            { key: 'worked', label: 'Worked', color: 'bg-yellow-100 text-yellow-800', icon: '⏰' },
            { key: 'steps', label: 'Steps', color: 'bg-purple-100 text-purple-800', icon: '👟' }
          ] as StatConfig[]).map(stat => {
            const lastValue = displayData[displayData.length - 1]?.[stat.key] || 0;
            return (
              <div key={stat.key} className={`p-3 rounded-lg ${stat.color}`}>
                <div className="flex items-center justify-between">
                  <span className="text-lg">{stat.icon}</span>
                  <span className="text-2xl font-bold">
                    {stat.key === 'steps' ? lastValue.toLocaleString() : lastValue}
                  </span>
                </div>
                <div className="text-sm font-medium mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VacationStatsChart;
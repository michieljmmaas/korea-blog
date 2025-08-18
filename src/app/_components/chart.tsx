import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatsSummaryCards from './chart-stats';

// Type definitions
interface StatsData {
    kimbap: number;
    cultural: number;
    steps: number;
    worked: number;
}

interface DayData {
    date: string;
    kimbap: number;
    cultural: number;
    steps: number;
    worked: number;
}

interface BlogStatsData {
    daily: DayData[];
    arrays: {
        dates: string[];
        kimbap: number[];
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

const VacationStatsChart: React.FC<VacationStatsChartProps> = ({ weekNumber = 1 }) => {
    const [chartData, setChartData] = useState<DayData[]>([]);
    const [displayData, setDisplayData] = useState<DayData[]>([]);
    const [showFullData, setShowFullData] = useState<boolean>(false);
    const [currentWeek] = useState<number>(weekNumber);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Add this function before the useEffect hooks
    const aggregateByWeeks = (data: DayData[]): DayData[] => {
        const weeks: DayData[] = [];

        for (let i = 0; i < data.length; i += 7) {
            const weekData = data.slice(i, i + 7);
            const weekNumber = Math.floor(i / 7) + 1;

            // Get the last day's values (since it's cumulative data)
            const lastDay = weekData[weekData.length - 1];

            weeks.push({
                date: `Week ${weekNumber}`,
                kimbap: lastDay.kimbap,
                cultural: lastDay.cultural,
                steps: lastDay.steps,
                worked: lastDay.worked
            });
        }

        return weeks;
    };

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
            // Aggregate by weeks for zoomed out view
            setDisplayData(aggregateByWeeks(chartData));
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

    // Format date for display
    const formatDate = (dateStr: string): string => {
        if (dateStr.startsWith('Week ')) {
            return dateStr; // Return "Week 1", "Week 2", etc.
        }
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    // Custom tooltip showing daily increases
    const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            // Find the current day's index in the display data
            const currentIndex = displayData.findIndex(day => day.date === label);
            const currentDay = displayData[currentIndex];
            const previousDay = currentIndex > 0 ? displayData[currentIndex - 1] : null;

            // Map chart names to data keys
            const nameToKey: { [key: string]: keyof DayData } = {
                'Kimbap Eaten': 'kimbap',
                'Sights Seen': 'cultural',
                'Hours Worked': 'worked',
                'Steps Taken': 'steps'
            };

            return (
                <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800">{`Date: ${label}`}</p>
                    {payload.map((entry, index) => {
                        const dataKey = nameToKey[entry.name];
                        const currentValue = currentDay?.[dataKey] as number || 0;
                        const previousValue = previousDay?.[dataKey] as number || 0;
                        const dailyIncrease = currentIndex === 0 ? currentValue : currentValue - previousValue;

                        return (
                            <p key={index} style={{ color: entry.color }} className="text-sm">
                                {`${entry.name}: +${dailyIncrease.toLocaleString()}`}
                                {currentIndex === 0 && <span className="text-gray-500 text-xs ml-1"></span>}
                            </p>
                        );
                    })}
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
            {/* Header - Hidden on mobile */}
            <div className="hidden md:flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    Vacation Stats - Cumulative Progress
                </h2>

                <div className="flex items-center gap-4">
                    {/* Toggle button */}
                    <button
                        onClick={toggleView}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        {showFullData ? `Show Week ${currentWeek}` : 'Show All Data'}
                    </button>
                </div>
            </div>

            {/* Chart info - Hidden on mobile */}
            <div className="hidden md:flex items-center justify-between text-sm text-gray-600">
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

            {/* Chart - Hidden on mobile */}
            <div className="hidden md:block bg-white p-4 rounded-lg border border-gray-200">
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            stroke="#666"
                            fontSize={12}
                        />
                        <YAxis yAxisId="left" stroke="#666" fontSize={12} />
                        <YAxis yAxisId="right" orientation="right" stroke="#666" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />

                        {/* Lines for each stat */}
                        <Line
                            type="monotone"
                            dataKey="kimbap"
                            stroke="#f8333c"
                            strokeWidth={2}
                            dot={{ fill: '#f8333c', strokeWidth: 2, r: 4 }}
                            name="Kimbap Eaten"
                            yAxisId="right"
                        />
                        <Line
                            type="monotone"
                            dataKey="cultural"
                            stroke="#2b9eb3"
                            strokeWidth={2}
                            dot={{ fill: '#2b9eb3', strokeWidth: 2, r: 4 }}
                            name="Sights Seen"
                            yAxisId="right"
                        />
                        <Line
                            type="monotone"
                            dataKey="worked"
                            stroke="#fcab10"
                            strokeWidth={2}
                            dot={{ fill: '#fcab10', strokeWidth: 2, r: 4 }}
                            name="Hours Worked"
                            yAxisId="right"
                        />
                        <Line
                            type="monotone"
                            dataKey="steps"
                            stroke="#44af69"
                            strokeWidth={2}
                            dot={{ fill: '#44af69', strokeWidth: 2, r: 4 }}
                            name="Steps Taken"
                            yAxisId="left"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Stats summary - now using the extracted component */}
            <StatsSummaryCards displayData={displayData} />
        </div>
    );
};

export default VacationStatsChart;
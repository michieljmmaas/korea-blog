import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import kimbapIcon from "../../../public/assets/blog/svg-icons/kimbap.svg";
import workIcon from "../../../public/assets/blog/svg-icons/worked.svg";
import culturalIcon from "../../../public/assets/blog/svg-icons/cultural.svg";
import stepsIcon from "../../../public/assets/blog/svg-icons/steps.svg";

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

interface StatConfig {
    key: keyof StatsData;
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
    svgPath: string;
    iconAlt: string;
}

const VacationStatsChart: React.FC<VacationStatsChartProps> = ({ weekNumber = 1 }) => {
    const [chartData, setChartData] = useState<DayData[]>([]);
    const [displayData, setDisplayData] = useState<DayData[]>([]);
    const [showFullData, setShowFullData] = useState<boolean>(false);
    const [currentWeek] = useState<number>(weekNumber);
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

    // SVG Icon component
    const SvgIcon: React.FC<{ statName: string; className?: string }> = ({ statName, className = "w-6 h-6" }) => {
        return (
            <img
                src={`/public/assets/blog/svg-icons/${statName}.svg`}
                alt={statName}
                className={className}
            />
        );
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
                    {/* Toggle button */}
                    <button
                        onClick={toggleView}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        {showFullData ? `Show Week ${currentWeek}` : 'Show All Data'}
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
                            stroke="#dc2626"
                            strokeWidth={2}
                            dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                            name="Kimbap"
                        />
                        <Line
                            type="monotone"
                            dataKey="cultural"
                            stroke="#2563eb"
                            strokeWidth={2}
                            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                            name="Cultural"
                        />
                        <Line
                            type="monotone"
                            dataKey="worked"
                            stroke="#d97706"
                            strokeWidth={2}
                            dot={{ fill: '#d97706', strokeWidth: 2, r: 4 }}
                            name="Worked"
                        />
                        <Line
                            type="monotone"
                            dataKey="steps"
                            stroke="#7c3aed"
                            strokeWidth={2}
                            dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4 }}
                            name="Steps"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Stats summary */}
            {displayData.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {([
                        { key: 'kimbap', label: 'Kimbap eaten', color: '#dc2626', bgColor: 'bg-red-100', textColor: 'text-red-800', svgPath: kimbapIcon, iconAlt: "Kimbap eaten" },
                        { key: 'cultural', label: 'Sights seen', color: '#2563eb', bgColor: 'bg-blue-100', textColor: 'text-blue-800', svgPath: culturalIcon, iconAlt: "Sights seen" },
                        { key: 'worked', label: 'Hours worked', color: '#d97706', bgColor: 'bg-amber-100', textColor: 'text-amber-800', svgPath: workIcon, iconAlt: "Hours worked" },
                        { key: 'steps', label: 'Steps taken', color: '#7c3aed', bgColor: 'bg-violet-100', textColor: 'text-violet-800', svgPath: stepsIcon, iconAlt: "Steps taken" }
                    ] as StatConfig[]).map(stat => {
                        const lastValue = displayData[displayData.length - 1]?.[stat.key] || 0;
                        return (
                            <div key={stat.key} className={`p-3 rounded-lg ${stat.bgColor}`}>
                                <div className="flex items-center justify-between">
                                    <Image
                                        src={stat.svgPath}
                                        alt={stat.label}
                                        title={stat.iconAlt}
                                        className="w-10 h-10 object-contain"
                                    />
                                    <span className="text-2xl font-bold">
                                        {stat.key === 'steps' ? lastValue.toLocaleString() : lastValue}
                                    </span>
                                </div>
                                <div className={`text-sm font-medium mt-1 ${stat.textColor}`}>{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default VacationStatsChart;
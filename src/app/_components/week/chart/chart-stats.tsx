import React from 'react';
import Image from 'next/image';
import kimbapIcon from "../../../../../public/assets/blog/svg-icons/kimbap.svg";
import workIcon from "../../../../../public/assets/blog/svg-icons/worked.svg";
import culturalIcon from "../../../../../public/assets/blog/svg-icons/cultural.svg";
import stepsIcon from "../../../../../public/assets/blog/svg-icons/steps.svg";

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

interface StatConfig {
    key: keyof StatsData;
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
    svgPath: string;
    iconAlt: string;
}

interface StatsSummaryCardsProps {
    displayData: DayData[];
}

const StatsSummaryCards: React.FC<StatsSummaryCardsProps> = ({ displayData }) => {
    const statsConfig: StatConfig[] = [
        {
            key: 'kimbap',
            label: 'Kimbap Eaten',
            color: '#f8333c',
            bgColor: 'kimbap-bg',
            textColor: 'kimbap-text',
            svgPath: kimbapIcon,
            iconAlt: 'Kimbap icon'
        },
        {
            key: 'cultural',
            label: 'Sights Seen',
            color: '#2b9eb3',
            bgColor: 'cultural-bg',
            textColor: 'cultural-text',
            svgPath: culturalIcon,
            iconAlt: 'Cultural sight icon'
        },
        {
            key: 'worked',
            label: 'Hours Worked',
            color: '#fcab10',
            bgColor: 'worked-bg',
            textColor: 'worked-text',
            svgPath: workIcon,
            iconAlt: 'Work icon'
        },
        {
            key: 'steps',
            label: 'Steps Taken',
            color: '#44af69',
            bgColor: 'steps-bg',
            textColor: 'steps-text',
            svgPath: stepsIcon,
            iconAlt: 'Steps icon'
        }
    ];

    if (displayData.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statsConfig.map(stat => {
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
    );
};

export default StatsSummaryCards;
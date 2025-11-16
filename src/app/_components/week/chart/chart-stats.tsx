import React from 'react';
import IconFactory from '../../common/icon-factory';
import { CityLocation } from '@/app/types';
import { getFoodName } from '../../../../../utils/foodName';

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
    iconName: string;
    iconAlt: string;
}

interface StatsSummaryCardsProps {
    dailyData: DayData[];
    cumulativeData: DayData[];
    currentWeek: number;
    showFullData: boolean;
    location: CityLocation;
}

const StatsSummaryCards: React.FC<StatsSummaryCardsProps> = ({ 
    dailyData, 
    cumulativeData, 
    currentWeek, 
    showFullData, 
    location 
}) => {
    const foodName = getFoodName(location) + " Eaten";

    const statsConfig: StatConfig[] = [
        {
            key: 'kimbap',
            label: foodName,
            color: '#f8333c',
            bgColor: 'kimbap-bg',
            textColor: 'kimbap-text',
            iconName: "kimbap",
            iconAlt: 'Kimbap icon'
        },
        {
            key: 'cultural',
            label: 'Sights Seen',
            color: '#2b9eb3',
            bgColor: 'cultural-bg',
            textColor: 'cultural-text',
            iconName: "cultural",
            iconAlt: 'Cultural sight icon'
        },
        {
            key: 'worked',
            label: 'Hours Worked',
            color: '#fcab10',
            bgColor: 'worked-bg',
            textColor: 'worked-text',
            iconName: "work",
            iconAlt: 'Work icon'
        },
        {
            key: 'steps',
            label: 'Steps Taken',
            color: '#44af69',
            bgColor: 'steps-bg',
            textColor: 'steps-text',
            iconName: "steps",
            iconAlt: 'Steps icon'
        }
    ];

    if (dailyData.length === 0 || cumulativeData.length === 0) {
        return null;
    }

    const getStatValue = (key: keyof StatsData): number => {
        if (showFullData) {
            // Show total (max cumulative value) when viewing all data
            const lastDay = cumulativeData[cumulativeData.length - 1];
            return lastDay?.[key] || 0;
        } else {
            // Show weekly total (sum of daily values for that week)
            const startIndex = Math.max(0, (currentWeek - 1) * 7);
            const endIndex = Math.min(dailyData.length, currentWeek * 7);
            const weekData = dailyData.slice(startIndex, endIndex);
            
            return weekData.reduce((sum, day) => sum + (day[key] || 0), 0);
        }
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statsConfig.map(stat => {
                const value = getStatValue(stat.key);
                return (
                    <div key={stat.key} className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <div className="flex items-center justify-between">
                            <IconFactory
                                name={stat.iconName}
                                size="lg"
                                titleMode="stat"
                                location={location}
                            />
                            <span className="text-2xl font-bold">
                                {stat.key === 'steps' ? value.toLocaleString() : value}
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
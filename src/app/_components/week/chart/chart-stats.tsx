import React from 'react';
import IconFactory from '../../common/icon-factory';
import { CityLocation } from '@/app/types';
import { getFoodName } from '../../../../../utils/foodName';

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
    iconName: string;
    iconAlt: string;
}

interface StatsSummaryCardsProps {
    displayData: DayData[];
    location: CityLocation;
}

const StatsSummaryCards: React.FC<StatsSummaryCardsProps> = ({ displayData, location }) => {
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
                            <IconFactory
                                name={stat.iconName}
                                size="lg"
                                titleMode="stat"
                                location={location}
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
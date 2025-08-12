import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { WeekData } from '@/app/types';

const CONTENT_DIR = path.join(process.cwd(), 'content/weekly');

export class WeekDataService {

    static async getWeekById(weekId: number): Promise<WeekData | null> {
        try {
            const filename = `week-${weekId}.md`;
            const filePath = path.join(CONTENT_DIR, filename);

            // Check if file exists
            if (!fs.existsSync(filePath)) {
                return null;
            }

            // Read and parse the markdown file
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const { data, content } = matter(fileContent);

            return {
                title: data.title || '',
                publishdate: data.publishdate || '',
                photos: data.photos || [],
                tags: data.tags || [],
                draft: data.draft ?? true,
                days: data.days || [],
                content,
                slug: `week-${weekId}`,
            };
        } catch (error) {
            console.error(`Error reading week ${weekId}:`, error);
            return null;
        }
    }

    /**
     * Get all available weeks
     */
    static async getAllWeeks(): Promise<WeekData[]> {
        try {
            const files = fs.readdirSync(CONTENT_DIR);
            const weekFiles = files.filter(file =>
                file.startsWith('week-') && file.endsWith('.md')
            );

            const weeks: WeekData[] = [];

            for (const file of weekFiles) {
                // Extract week number from filename
                const match = file.match(/week-(\d+)\.md/);
                if (match) {
                    const weekId = parseInt(match[1], 10);
                    const weekData = await this.getWeekById(weekId);
                    if (weekData) {
                        weeks.push(weekData);
                    }
                }
            }

            // Sort by week number
            return weeks.sort((a, b) => {
                const aNum = parseInt(a.slug.split('-')[1]);
                const bNum = parseInt(b.slug.split('-')[1]);
                return aNum - bNum;
            });
        } catch (error) {
            console.error('Error reading weeks directory:', error);
            return [];
        }
    }

    /**
     * Get total number of available weeks
     */
    static async getWeekCount(): Promise<number> {
        try {
            const files = fs.readdirSync(CONTENT_DIR);
            return files.filter(file =>
                file.startsWith('week-') && file.endsWith('.md')
            ).length;
        } catch (error) {
            console.error('Error counting weeks:', error);
            return 0;
        }
    }

    /**
     * Check if a specific week exists
     */
    static async weekExists(weekId: number): Promise<boolean> {
        const filename = `week-${weekId}.md`;
        const filePath = path.join(CONTENT_DIR, filename);
        return fs.existsSync(filePath);
    }
}
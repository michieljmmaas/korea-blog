import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { WeekData, WeekLinkInfo } from '@/app/types';

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
                index: data.index,
                title: data.title || '',
                publishdate: data.publishdate || '',
                photos: data.photos || [],
                tags: data.tags || [],
                draft: data.draft ?? true,
                days: data.days || [],
                location: data.location,
                thumb: data.thumb,
                content,
                slug: `week-${weekId}`,
                icons: data.icons
            };
        } catch (error) {
            console.error(`Error reading week ${weekId}:`, error);
            return null;
        }
    }

    static async getRandomWeek(current: number | null): Promise<WeekData> {
        let random = Math.floor(Math.random() * 11);

        while (random === current) 
            random = Math.floor(Math.random() * 11);{
        }

        return this.getWeekById(random).then(data => {
            if (!data) {
                throw Error("no data");
            }
            return data;
        });
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

    /**
     * Get the latest week (highest index) that is not a draft
     */
    static async getLatestWeek(): Promise<WeekData | null> {
        try {
            const weeks = await this.getAllWeeks();

            // Filter out drafts and find the one with highest index
            const publishedWeeks = weeks.filter(week => !week.draft);

            if (publishedWeeks.length === 0) {
                return null;
            }

            // Find week with highest index
            return publishedWeeks.reduce((latest, current) => {
                return current.index > latest.index ? current : latest;
            });
        } catch (error) {
            console.error('Error getting latest week:', error);
            return null;
        }
    }

    // Get adjacent posts for navigation
    static async getAdjacentWeeks(weekIndex: number): Promise<{
        previousPost: WeekLinkInfo | null;
        nextPost: WeekLinkInfo | null;
    }> {
        try {
            const weeks = await this.getAllWeeks();

            const previousWeekFind = weeks[weekIndex - 1] ?? { week: -1, draft: true, slug: "" };
            const prevWeek = previousWeekFind && { week: previousWeekFind.index, isDraft: previousWeekFind.draft, slug: `${previousWeekFind.index}` };
            const nextWeekFind = weeks[weekIndex + 1] ?? { week: 11, draft: true, slug: "" };;
            const nextWeek = nextWeekFind && { week: nextWeekFind.index, isDraft: nextWeekFind.draft, slug: `${nextWeekFind.index}` };

            return {
                previousPost: prevWeek,
                nextPost: nextWeek,
            };
        } catch (error) {
            console.error('Error getting adjacent posts:', error);
            return { previousPost: null, nextPost: null };
        }
    }


    // Get week for day
    static async getWeekForDay(dayIndex: number): Promise<WeekLinkInfo | null> {
        const weekNumner = Math.ceil(dayIndex / 7)
        const week = await this.getWeekById(weekNumner);
        return week && { week: week.index, isDraft: week.draft, slug: `${week.index}` };
    }

}
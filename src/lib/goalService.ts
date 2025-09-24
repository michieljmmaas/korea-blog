import { Goal } from "@/app/types";
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const GOAL_FILE = path.join(process.cwd(), 'content/goals/goals.yaml');

export class GoalService {
    static async getAllGoals(): Promise<Goal[]> {
        try {

            // Check if file exists
            if (!fs.existsSync(GOAL_FILE)) {
                return [];
            }

            const fileContent = fs.readFileSync(GOAL_FILE, 'utf8');
            const data = yaml.load(fileContent) as Goal[];
            return data;
        } catch (error) {
            return [];
        }
    }

}
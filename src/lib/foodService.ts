import { Food } from "@/app/types";
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const FOOD_FILE = path.join(process.cwd(), 'content/food/food.yaml');

interface FoodData {
    foods: Food[]
}


export class FoodService {
    static async getAllFoods(): Promise<Food[]> {
        try {

            // Check if file exists
            if (!fs.existsSync(FOOD_FILE)) {
                return [];
            }

            const fileContent = fs.readFileSync(FOOD_FILE, 'utf8');
            const data = yaml.load(fileContent) as FoodData;
            return data.foods;
        } catch (error) {
            return [];
        }
    }
}
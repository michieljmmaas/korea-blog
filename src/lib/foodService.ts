import { Food, LocationCategoryGroupedFoods } from "@/app/types";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const FOOD_FILE = path.join(process.cwd(), "content/food/food.yaml");

export class FoodService {
  static async getAllFoods(): Promise<Food[]> {
    try {
      // Check if file exists
      if (!fs.existsSync(FOOD_FILE)) {
        return [];
      }

      const fileContent = fs.readFileSync(FOOD_FILE, "utf8");
      const data = yaml.load(fileContent) as Food[];
      return data;
    } catch (error) {
      return [];
    }
  }

  static async getAllFoodsGrouped(): Promise<LocationCategoryGroupedFoods[]> {
    const foods = await this.getAllFoods();

    const groupedByLocation: Record<string, Record<string, Food[]>> = {};

    for (const food of foods) {
      if (!groupedByLocation[food.location]) {
        groupedByLocation[food.location] = {};
      }
      if (!groupedByLocation[food.location][food.category]) {
        groupedByLocation[food.location][food.category] = [];
      }
      groupedByLocation[food.location][food.category].push(food);
    }

    const result: LocationCategoryGroupedFoods[] = Object.entries(
      groupedByLocation
    ).map(([location, categoriesObj]) => ({
      location,
      categories: Object.entries(categoriesObj).map(([category, foods]) => ({
        category,
        foods: foods.sort((a, b) => {
          // Sort by tried status: tried items first (true before false)
          if (a.tried === b.tried) return 0;
          return a.tried ? -1 : 1;
        }),
      })),
    }));

    return result;
  }
}

import { GeoLocation, GeoData } from "@/app/types";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const GEODATA_FILE = path.join(
  process.cwd(),
  "content/locations/locations.yaml",
);

let cachedGeoData: GeoData | null = null;

export class GeoDataService {
  /**
   * Get all geodata from the YAML file (cached)
   */
  static async getAllGeoData(): Promise<GeoData> {
    if (cachedGeoData !== null) {
      return cachedGeoData;
    }

    try {
      // Check if file exists
      if (!fs.existsSync(GEODATA_FILE)) {
        cachedGeoData = {};
        return cachedGeoData;
      }

      const fileContent = fs.readFileSync(GEODATA_FILE, "utf8");
      const data = yaml.load(fileContent, {
        schema: yaml.JSON_SCHEMA, // Use JSON schema which doesn't auto-parse dates
      }) as GeoData;

      // Convert time strings to Date objects
      const processedData: GeoData = {};
      Object.keys(data).forEach((dateKey) => {
        processedData[dateKey] = data[dateKey].map((location) => ({
          ...location,
          //@ts-ignore
          time: this.parseTimeString(location.time),
        }));
      });

      // Sort by date keys
      const sortedData: GeoData = {};
      Object.keys(processedData)
        .sort()
        .forEach((key) => {
          sortedData[key] = processedData[key];
        });

      cachedGeoData = sortedData;
      return sortedData;
    } catch (error) {
      console.error("Error reading geodata file:", error);
      cachedGeoData = {};
      return {};
    }
  }

  /**
   * Get locations for a specific date
   * @param date - Date string in format "YYYY/MM/DD" (e.g., "2025/12/01")
   */
  static async getLocationsByDate(date: string): Promise<GeoLocation[]> {
    try {
      const allData = await this.getAllGeoData();
      return allData[date] || [];
    } catch (error) {
      console.error(`Error getting locations for date ${date}:`, error);
      return [];
    }
  }

  /**
   * Get all available dates
   */
  static async getAllDates(): Promise<string[]> {
    try {
      const allData = await this.getAllGeoData();
      return Object.keys(allData).sort();
    } catch (error) {
      console.error("Error getting all dates:", error);
      return [];
    }
  }

  /**
   * Parse time string to Date object
   * @param timeStr - Time string in format "DD/MM/YYYY HH:MM"
   */
  private static parseTimeString(timeStr: string): string {
    // Format: "20/11/2025 02:41"
    const [datePart, timePart] = timeStr.split(" ");
    const [day, month, year] = datePart.split("/").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute).toISOString();
  }
}

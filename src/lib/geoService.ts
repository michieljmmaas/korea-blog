import { GeoLocation, GeoData } from "@/app/types";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const GEODATA_FILE = path.join(
  process.cwd(),
  "content/locations/locations.yaml",
);

export class GeoDataService {
  /**
   * Get all geodata from the YAML file
   */
  static async getAllGeoData(): Promise<GeoData> {
    try {
      // Check if file exists
      if (!fs.existsSync(GEODATA_FILE)) {
        return {};
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

      return sortedData;
    } catch (error) {
      console.error("Error reading geodata file:", error);
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
   * Get locations within a date range
   * @param startDate - Start date string in format "YYYY/MM/DD"
   * @param endDate - End date string in format "YYYY/MM/DD"
   */
  static async getLocationsByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<GeoData> {
    try {
      const allData = await this.getAllGeoData();
      const filteredData: GeoData = {};

      // Convert date strings to comparable format
      const parseDate = (dateStr: string): Date => {
        const [year, month, day] = dateStr.split("/");
        return new Date(parseInt(year), parseInt(month), parseInt(day));
      };

      const start = parseDate(startDate);
      const end = parseDate(endDate);

      Object.keys(allData).forEach((date) => {
        const current = parseDate(date);
        if (current >= start && current <= end) {
          filteredData[date] = allData[date];
        }
      });

      return filteredData;
    } catch (error) {
      console.error("Error getting locations by date range:", error);
      return {};
    }
  }

  /**
   * Get total number of locations across all dates
   */
  static async getTotalLocationCount(): Promise<number> {
    try {
      const allData = await this.getAllGeoData();
      return Object.values(allData).reduce(
        (total, locations) => total + locations.length,
        0,
      );
    } catch (error) {
      console.error("Error getting total location count:", error);
      return 0;
    }
  }

  /**
   * Parse time string to Date object
   * @param timeStr - Time string in format "DD/MM/YYYY HH:MM"
   */
  private static parseTimeString(timeStr: string): Date {
    // Format: "20/11/2025 02:41"
    const [datePart, timePart] = timeStr.split(" ");
    const [day, month, year] = datePart.split("/").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hour + 7, minute);
  }
}

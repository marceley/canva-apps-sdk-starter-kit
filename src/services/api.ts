import type { Box, BoxData } from "../types";
import boxesData from "../../data/boxes.json";
import boxData from "../../data/box.json";

/**
 * Fetches all available boxes
 * TODO: Replace with real API call when backend is ready
 */
export async function fetchBoxes(): Promise<Box[]> {
  // Mock: return data from local JSON file
  return boxesData as Box[];
}

/**
 * Fetches box data for a specific box and week
 * TODO: Replace with real API call when backend is ready
 * @param boxId - The ID of the box to fetch
 * @param week - The week identifier (wwyy format)
 */
export async function fetchBoxData(
  boxId: string,
  week: string,
): Promise<BoxData> {
  // Mock: return data from local JSON file
  // In real implementation, this would be: return fetch(`/api/boxes/${boxId}/week/${week}`)
  return boxData as BoxData;
}

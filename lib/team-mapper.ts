import { WC_2026_CONFIG } from "./wc2026-config";

/**
 * Normalizes variations of team names returned by external APIs
 * to our canonical English team names defined in WC_2026_CONFIG.
 * 
 * This helps us match teams regardless of whether the API sends
 * "Bosnia and Herzegovina", "Bosnia-Herzegovina", "Bosnia & Herzegovina" etc.
 */
export function normalizeApiTeamName(apiName: string | undefined | null): string {
  if (!apiName || typeof apiName !== 'string') return "";
  const name = apiName.toLowerCase().trim();

  // Mappings for common mismatches and edge cases across APIs
  if (name.includes("bosnia")) return "bosnia & herzegovina";
  if (name.includes("south korea") || name.includes("korea republic")) return "south korea";
  if (name.includes("czech") || name.includes("czechia")) return "czechia"; // our config uses "Czechia"
  if (name === "usa" || name === "united states" || name.includes("united states of america")) return "usa";
  if (name.includes("ivory coast") || name.includes("cote d'ivoire") || name.includes("côte d'ivoire")) return "ivory coast";
  if (name.includes("dr congo") || name.includes("congo dr") || name === "democratic republic of the congo" || name.includes("congo, democratic republic")) return "dr congo";
  if (name.includes("cape verde") || name.includes("cabo verde")) return "cape verde";
  if (name.includes("south africa") || name === "rsa") return "south africa";
  if (name === "mexico") return "mexico";
  if (name === "turkey" || name === "türkiye") return "turkey";

  // If no specific override, return the normalized string for direct matching
  return name;
}

/**
 * Attempts to find a canonical team from our WC_2026_CONFIG by matching
 * the provided API name (or our own internal Turkish/English names).
 */
export function findCanonicalTeam(searchName: string | undefined | null) {
  if (!searchName || typeof searchName !== 'string') return null;
  const normalizedSearch = normalizeApiTeamName(searchName);

  return WC_2026_CONFIG.teams.find(t => {
    const configEng = normalizeApiTeamName(t.name);
    const configTr = (t.turkishName || "").toLowerCase().trim();
    const configCode = (t.code || "").toLowerCase().trim();

    return configEng === normalizedSearch || 
           configTr === normalizedSearch || 
           configCode === normalizedSearch ||
           configEng.includes(normalizedSearch) || 
           normalizedSearch.includes(configEng) ||
           configTr.includes(normalizedSearch) || 
           normalizedSearch.includes(configTr);
  });
}

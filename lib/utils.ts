/**
 * lib/utils.ts
 * Genel yardımcı fonksiyonlar
 */

// ============================================================
// Maç Durumu
// ============================================================
export type MatchStatus = "live" | "finished" | "upcoming" | "halftime" | "postponed";

export function getMatchStatus(statusShort: string): MatchStatus {
  const liveStatuses = ["1H", "2H", "ET", "BT", "P", "LIVE"];
  const finishedStatuses = ["FT", "AET", "PEN"];
  const halftimeStatuses = ["HT"];

  if (liveStatuses.includes(statusShort)) return "live";
  if (finishedStatuses.includes(statusShort)) return "finished";
  if (halftimeStatuses.includes(statusShort)) return "halftime";
  if (["PST", "CANC", "ABD", "AWD", "WO"].includes(statusShort)) return "postponed";
  return "upcoming";
}

export function getStatusLabel(statusShort: string): string {
  const labels: Record<string, string> = {
    NS: "Başlamadı",
    "1H": "1. Yarı",
    HT: "Devre Arası",
    "2H": "2. Yarı",
    ET: "Uzatma",
    BT: "Uzatma Arası",
    P: "Penaltı",
    FT: "Maç Sona Erdi",
    AET: "Uzatmada Bitti",
    PEN: "Penaltıda Bitti",
    PST: "Ertelendi",
    CANC: "İptal",
    LIVE: "Canlı",
  };
  return labels[statusShort] || statusShort;
}

// ============================================================
// Tarih & Saat Formatlama
// ============================================================
export function formatMatchTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  });
}

export function formatMatchDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Europe/Istanbul",
  });
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    timeZone: "Europe/Istanbul",
  });
}

export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// ============================================================
// Ülke Bayrağı URL'si
// ============================================================
export function getFlagUrl(countryCode: string, size: 16 | 24 | 32 | 48 | 64 | 96 = 32): string {
  return `https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${countryCode.toLowerCase()}.png`;
}

// ============================================================
// Skor Gösterimi
// ============================================================
export function formatScore(home: number | null, away: number | null): string {
  if (home === null || away === null) return "- : -";
  return `${home} : ${away}`;
}

// ============================================================
// İstatistik Yüzdesi
// ============================================================
export function parseStatValue(value: string | number | null): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const parsed = parseFloat(value.replace("%", ""));
  return isNaN(parsed) ? 0 : parsed;
}

export function calculateStatPercentage(homeVal: number, awayVal: number): [number, number] {
  const total = homeVal + awayVal;
  if (total === 0) return [50, 50];
  return [Math.round((homeVal / total) * 100), Math.round((awayVal / total) * 100)];
}

// ============================================================
// Renk Yardımcıları
// ============================================================
export function getResultColor(result: "win" | "draw" | "loss"): string {
  const colors = {
    win: "text-status-win",
    draw: "text-status-draw",
    loss: "text-status-loss",
  };
  return colors[result];
}

export function getMinuteDisplay(elapsed: number | null, statusShort: string): string {
  if (statusShort === "HT") return "DA";
  if (statusShort === "FT") return "MS";
  if (elapsed !== null) return `${elapsed}'`;
  return "";
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

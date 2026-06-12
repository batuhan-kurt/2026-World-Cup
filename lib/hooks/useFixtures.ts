"use client";

import useSWR from "swr";
import { MatchResponse } from "../api";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useFixtures() {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: MatchResponse[] }>(
    "/api/fixtures",
    fetcher,
    {
      refreshInterval: 60000, // Her 1 dakikada bir otomatik yenile
      revalidateOnFocus: true,
    }
  );

  const matches = data?.data || [];

  // API-Football status mapping
  const liveStatuses = ["1H", "2H", "HT", "ET", "BT", "P", "LIVE"];
  const finishedStatuses = ["FT", "AET", "PEN"];
  
  const liveMatches = matches.filter(m => liveStatuses.includes(m.fixture.status.short));
  const finishedMatches = matches.filter(m => finishedStatuses.includes(m.fixture.status.short));
  const upcomingMatches = matches.filter(m => !liveStatuses.includes(m.fixture.status.short) && !finishedStatuses.includes(m.fixture.status.short));

  return {
    matches,
    liveMatches,
    finishedMatches,
    upcomingMatches,
    isLoading,
    isError: error,
    error,
    refresh: mutate,
    lastUpdated: new Date(),
  };
}

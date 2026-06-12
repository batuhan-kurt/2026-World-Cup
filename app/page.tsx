import OverviewClient from "@/components/matches/OverviewClient";
import { getFixturesData } from "@/lib/data-service";

export const revalidate = 300;

export default async function HomePage() {
  const fixtures = getFixturesData();

  return (
    <OverviewClient fixtures={fixtures} />
  );
}

import { Hero } from "@/components/hero";
import { InfoCards } from "@/components/info-cards";
import { Expect } from "@/components/expect";
import { Standards } from "@/components/standards";
import { KeyDivider } from "@/components/key-divider";
import { Reviews } from "@/components/reviews";
import { FeaturedUnits } from "@/components/featured-units";
import { StayTypes } from "@/components/stay-types";
import { Services } from "@/components/services";
import { Rules } from "@/components/rules";
import { listUnits } from "@/lib/db";

export const revalidate = 0;

export default async function Home() {
  const units = await listUnits().catch(() => []);
  return (
    <>
      <Hero />
      <InfoCards />
      <Expect />
      <Standards />
      <KeyDivider className="my-2 sm:my-4" width="md" />
      <Reviews />
      <FeaturedUnits units={units} />
      <StayTypes />
      <Services />
      <Rules />
    </>
  );
}

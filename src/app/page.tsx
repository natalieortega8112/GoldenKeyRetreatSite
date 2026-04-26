import { Hero } from "@/components/hero";
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
      <Expect />
      <Standards />
      <KeyDivider className="my-2 sm:my-4" />
      <Reviews />
      <FeaturedUnits units={units} />
      <StayTypes />
      <Services />
      <Rules />
    </>
  );
}

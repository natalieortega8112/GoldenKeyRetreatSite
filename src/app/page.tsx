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
      <KeyDivider className="my-2 sm:my-3" />
      <InfoCards />
      <KeyDivider className="my-2 sm:my-3" />
      <Expect />
      <KeyDivider className="my-2 sm:my-3" />
      <Standards />
      <KeyDivider className="my-2 sm:my-3" />
      <Reviews />
      <KeyDivider className="my-2 sm:my-3" />
      <FeaturedUnits units={units} />
      <KeyDivider className="my-2 sm:my-3" />
      <StayTypes />
      <KeyDivider className="my-2 sm:my-3" />
      <Services />
      <KeyDivider className="my-2 sm:my-3" />
      <Rules />
    </>
  );
}

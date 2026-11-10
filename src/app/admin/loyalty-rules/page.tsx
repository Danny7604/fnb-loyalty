import { redirect } from "next/navigation";

export default function LoyaltyRulesRedirect() {
  redirect("/admin?tab=rewards");
}

import { redirect } from "next/navigation";

export default function VouchersRedirect() {
  redirect("/admin?tab=vouchers");
}

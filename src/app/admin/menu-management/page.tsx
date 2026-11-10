import { redirect } from "next/navigation";

export default function MenuManagementRedirect() {
  redirect("/admin?tab=menu");
}

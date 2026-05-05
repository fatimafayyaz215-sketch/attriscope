import { redirect } from "next/navigation";

/**
 * Root route ( / ) — immediately redirects to the login page.
 * Once auth is wired up this will redirect authenticated users to /overview.
 */
export default function RootPage() {
  redirect("/login");
}

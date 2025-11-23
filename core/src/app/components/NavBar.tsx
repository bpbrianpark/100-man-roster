import ClientNavBar from "./ClientNavBar";

export default async function NavBar() {
  // Supabase handles auth state via cookies, no need to pass session
  return <ClientNavBar />;
}

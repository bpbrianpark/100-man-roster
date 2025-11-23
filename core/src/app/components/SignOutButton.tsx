'use client';

import './button.css'
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  
  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push('/');
    router.refresh(); // Refresh to update auth state
  };

  return (
    
    <button onClick={handleSignOut} className="signout-button">
      Sign Out
    </button>
  );
}
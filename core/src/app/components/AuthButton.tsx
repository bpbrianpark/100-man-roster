"use client";

import "./button.css";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../../lib/hooks/useUserProfile";
import { User, LogIn } from "lucide-react";

export default function AuthButton() {
  const router = useRouter();
  const { profile } = useUserProfile();

  const handleClick = () => {
    if (profile?.username) {
      router.push(`/profile/${profile.username}`);
    } else {
      router.push("/sign-in");
    }
  };

  return (
    <button onClick={handleClick} className="header-button">
      {profile?.username ? (
        <>
          <User className="header-button-icon" />
          Profile
        </>
      ) : (
        <>
          <LogIn className="header-button-icon" />
          Sign In
        </>
      )}
    </button>
  );
}

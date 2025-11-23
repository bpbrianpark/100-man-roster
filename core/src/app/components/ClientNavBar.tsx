'use client';

import "./navbar.css";
import Link from "next/link";
import SignOutButton from "./SignOutButton";
import SignInButton from "./SignInButton";
import InfoDialog from "./InfoDialog";
import { useCallback, useState } from "react";
import { CircleQuestionMark } from "lucide-react";
import { useUserProfile } from "../../lib/hooks/useUserProfile";

export default function ClientNavBar() {
  const { profile } = useUserProfile();
  const [showInfoDialog, setShowInfoDialog] = useState(false);

  const getUserInitials = (username: string) => {
    return username
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleClickInfoButton = useCallback(() => {
    setShowInfoDialog(true);
  }, [showInfoDialog])

  const handleCloseInfoDialog = useCallback(() => {
    setShowInfoDialog(false);
  }, [showInfoDialog])

  return (
    <div className="navbar-container">
      <nav className="navbar">
        <div className="home-section">
          <Link href="/" className="home-icon-link">
            <img src="/igloologoonly.png" alt="Home" className="home-icon" />
          </Link>
          <div className="info-button-mobile" onClick={handleClickInfoButton}>
            <CircleQuestionMark size={24}/>
          </div>
        </div>
          <div className="title-section">
            <Link href="/">
              <img src="/fullnamelogo.png" alt="Bungalow" className="navbar-logo" />
            </Link>
          </div>
          <div className="right-side-buttons">
            <Link href="/categories" className="categories-link">
              Categories
            </Link>
            <div className="info-button-desktop" onClick={handleClickInfoButton}>
              <CircleQuestionMark size={24}/>
            </div>
        {profile ? (
          <div className="navbar-user-section">
            <Link href={`/profile/${profile.username}`} className="profile-link">
              <div className="navbar-profile-circle">
                {profile.image ? (
                  <img src={profile.image} alt="Profile" />
                ) : (
                  <span className="navbar-profile-initials">
                    {getUserInitials(profile.username || 'U')}
                  </span>
                )}
              </div>
              <span className="navbar-username">
                {profile.username}
              </span>
            </Link>
            <SignOutButton />
          </div>
        ) : (
          <SignInButton />
        )}
        </div>
      </nav>

      <InfoDialog
        isOpen={showInfoDialog}
        onClose={handleCloseInfoDialog}
      />
    </div>
  );
}
"use client";

import { useUserProfile } from "../../lib/hooks/useUserProfile";
import "./hero-section.css";

export default function HeroSection() {
  const { profile } = useUserProfile();
  const isLoggedIn = !!profile;

  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Test Your Knowledge</h1>
        <p className="hero-subtitle">
          How many (x) can you name in (x) amount of time?
          
          {isLoggedIn 
            ? ` Welcome back, ${profile?.username}!` 
            : " Sign up to track your scores and compete on leaderboards."}
        </p>
        <div className="hero-cta">
          {!isLoggedIn && (
            <a href="/sign-up" className="hero-button primary">
              Get Started
            </a>
          )}
          <a href="#categories" className="hero-button secondary">
            Browse Categories
          </a>
        </div>
      </div>
    </div>
  );
}


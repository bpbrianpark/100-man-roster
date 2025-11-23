"use client";

import "./footer.css";
import Link from "next/link";

export default function Footer() {
  return (
    <div className="footer-container">
      <div className="footer-content">
        <div className="copyright-disclaimer">
          <span className="disclaimer-text">
            Copyright © 2025 Brian Park. All rights reserved.
          </span>
          <span className="disclaimer-text">
            Data is from https://www.wikidata.org/wiki/.
          </span>
        </div>

        <div className="links-section">
          <Link href="/privacy" className="footer-text">
            Privacy Policy
          </Link>
          <Link href="/terms" className="footer-text">
            Terms of Use
          </Link>
        </div>
      </div>
    </div>
  );
}

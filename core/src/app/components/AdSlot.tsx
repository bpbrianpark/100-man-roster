"use client";

import { CSSProperties, useEffect, useRef } from "react";
import "./ad-slot.css";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSlotProps = {
  slot?: string;
  format?: string;
  layout?: string;
  fullWidthResponsive?: "true" | "false";
  className?: string;
  style?: CSSProperties;
};

export default function AdSlot({
  slot,
  format = "auto",
  layout,
  fullWidthResponsive = "true",
  className,
  style,
}: AdSlotProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const isConfigured = Boolean(client && slot);
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    if (!isConfigured || !adRef.current) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("[AdSlot] Failed to push adsbygoogle request", error);
    }
  }, [isConfigured, slot]);

  if (!isConfigured) {
    return (
      <div className={`ad-slot-placeholder ${className ?? ""}`} style={style}>
        {"PLACEHOLDER"}
      </div>
    );
  }

  return (
    <div className={`ad-slot-wrapper ${className ?? ""}`} style={style}>
      <ins
        className="adsbygoogle"
        ref={adRef}
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive}
        data-ad-layout={layout}
      />
    </div>
  );
}

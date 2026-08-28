"use client";

import { useState } from "react";

type DashboardAvatarProps = {
  avatarUrl?: string;
  alt: string;
  fallbackText: string;
};

const DashboardAvatar = ({ avatarUrl, alt, fallbackText }: DashboardAvatarProps) => {
  const [imgError, setImgError] = useState(false);

  if (avatarUrl && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={alt}
        className="h-14 w-14 shrink-0 rounded-full border border-[#E7E2D2]"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#E7E2D2] bg-white text-lg font-semibold text-[#4B4739]">
      {fallbackText.slice(0, 1)}
    </div>
  );
};

export default DashboardAvatar;

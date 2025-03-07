
import React from "react";

export const SpotifyIcon = ({ className, size = 24, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 11.857a4.002 4.002 0 0 1 3.874-3.84c1.272.028 2.536.393 3.613 1.083" />
      <path d="M8 15.143a4.002 4.002 0 0 1 3.874-3.84c1.272.028 2.536.393 3.613 1.083" />
      <path d="M8 8.571a4.002 4.002 0 0 1 3.874-3.84A8.8 8.8 0 0 1 15.487 5.813" />
    </svg>
  );
};

export default SpotifyIcon;

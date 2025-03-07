
import React from "react";

export const SpotifyIcon = ({ className, size = 24, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) => {
  return (
    <svg 
      role="img" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg" 
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      {...props}
    >
      <title>Spotify</title>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm5.387 17.543a.75.75 0 0 1-1.03.244c-2.82-1.728-6.369-2.118-10.549-1.161a.75.75 0 0 1-.313-1.466c4.503-1.016 8.382-.573 11.525 1.358a.75.75 0 0 1 .244 1.025Zm1.474-3.206a.9.9 0 0 1-1.242.293c-3.204-2.002-8.093-2.58-11.88-1.412a.9.9 0 0 1-.54-1.712c4.214-1.33 9.516-.701 13.197 1.558a.9.9 0 0 1 .293 1.273Zm.188-3.305c-3.847-2.278-10.198-2.484-13.927-1.412a1.05 1.05 0 1 1-.584-2.02c4.247-1.229 11.107-.99 15.474 1.562a1.05 1.05 0 0 1-1.063 1.87Z"/>
    </svg>
  );
};

export default SpotifyIcon;

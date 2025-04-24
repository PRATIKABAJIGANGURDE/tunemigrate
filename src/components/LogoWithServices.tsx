
import React from 'react';
import { Youtube, Minus } from 'lucide-react';
import SpotifyIcon from './icons/SpotifyIcon';

const LogoWithServices = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-white p-2 rounded-xl shadow-sm">
        <Youtube className="h-5 w-5 text-[#FF0000]" />
        <Minus className="h-5 w-5 mx-1 text-primary" />
        <SpotifyIcon className="h-5 w-5 text-[#1DB954]" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-playfair">
          <span className="text-foreground">Tune</span>
          <span className="text-primary">Migrate</span>
        </h1>
        <p className="text-xs text-muted-foreground -mt-1 font-medium">YouTube to Spotify converter</p>
      </div>
    </div>
  );
};

export default LogoWithServices;

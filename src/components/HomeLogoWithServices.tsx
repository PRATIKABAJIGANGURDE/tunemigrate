import React from 'react';
import { motion } from "framer-motion";

const HomeLogoWithServices = () => {
  return (
    <div className="flex items-center gap-3 logo-animation">
      <div className="flex items-center">
        {/* App Window Logo for Home */}
        <motion.div 
          className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shadow-md border border-gray-100 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        > 
          <img 
            src="public/favicon.png" 
            alt="App Logo" 
            className="w-8 h-8 object-contain"
          />
        </motion.div>

        {/* Small Blue Connecting Line */}
        <div className="relative mx-1">
          <motion.div 
            className="h-0.5 bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "1.5rem" }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
        </div>

        {/* Music Icon Container */}
        <motion.div 
          className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shadow-md border border-gray-100 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <img 
            src="public/favicon.png" 
            alt="Music Icon" 
            className="w-8 h-8 object-contain"
          />
        </motion.div>
      </div>

      {/* Text Section with Animation */}
      <motion.div 
        className="ml-2"
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-foreground">Tune</span>
          <span className="text-primary">Migrate</span>
        </h1>
        <p className="text-xs text-muted-foreground -mt-1">Your Music Journey, Simplified</p>
      </motion.div>
    </div>
  );
};

export default HomeLogoWithServices;


import React from 'react';
import { motion } from "framer-motion";

const HomeLogoWithServices = () => {
  return (
    <div className="flex items-center gap-2 md:gap-3 logo-animation">
      <div className="flex items-center">
        {/* App Window Logo for Home */}
        <motion.div 
          className="w-8 h-8 md:w-12 md:h-12 bg-gray-50 rounded-xl flex items-center justify-center shadow-md border border-gray-100 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        > 
          <img 
            src="public/favicon.png" 
            alt="App Logo" 
            className="w-6 h-6 md:w-8 md:h-8 object-contain"
          />
        </motion.div>

        {/* Small Blue Connecting Line */}
        
      </div>

      {/* Text Section with Animation */}
      <motion.div 
        className="ml-1 md:ml-2"
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h1 className="text-lg md:text-2xl font-bold tracking-tight">
          <span className="text-foreground">Tune</span>
          <span className="text-primary">Migrate</span>
        </h1>
        <p className="text-xs text-muted-foreground -mt-1">Your Music Journey, Simplified</p>
      </motion.div>
    </div>
  );
};

export default HomeLogoWithServices;

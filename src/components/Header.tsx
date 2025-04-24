
import { motion } from "framer-motion";
import { logoAnimation } from "@/lib/motionVariants";

const Header = () => {
  return (
    <motion.header 
      className="flex items-center w-full pt-6 pb-4"
      initial="hidden"
      animate="visible"
      variants={logoAnimation}
    >
      <div className="flex items-center gap-3 logo-animation">
        <motion.div 
          className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shadow-md border border-gray-100"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="12" x2="12" y1="4" y2="20" />
          </svg>
        </motion.div>

        <motion.div 
          className="ml-2"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold tracking-tight font-playfair">
            <span className="text-foreground">Tune</span>
            <span className="text-primary">Migrate</span>
          </h1>
          <p className="text-xs text-muted-foreground -mt-1 font-medium">Music Migration Simplified</p>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;

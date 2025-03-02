
import { motion } from "framer-motion";
import { logoAnimation } from "@/lib/motionVariants";

const Header = () => {
  return (
    <motion.header 
      className="flex items-center justify-center w-full pt-10 pb-6"
      initial="hidden"
      animate="visible"
      variants={logoAnimation}
    >
      <div className="flex items-center gap-2 logo-animation">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-youtube rounded-full flex items-center justify-center text-white font-bold">
            YT
          </div>
          <motion.div 
            className="h-0.5 w-8 bg-gradient-to-r from-youtube to-spotify"
            initial={{ width: 0 }}
            animate={{ width: "2rem" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
          <div className="w-10 h-10 bg-spotify rounded-full flex items-center justify-center text-white font-bold">
            SP
          </div>
        </div>
        <div className="ml-2">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-foreground">Tune</span>
            <span className="text-primary">Migrate</span>
          </h1>
          <p className="text-xs text-muted-foreground -mt-1">YouTube to Spotify converter</p>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

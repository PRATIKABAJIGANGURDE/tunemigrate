
import { motion } from "framer-motion";
import { logoAnimation } from "@/lib/motionVariants";
import LogoWithServices from "./LogoWithServices";

const Header = () => {
  return (
    <motion.header 
      className="flex items-center w-full pt-6 pb-4"
      initial="hidden"
      animate="visible"
      variants={logoAnimation}
    >
      <div className="flex items-center gap-3 logo-animation">
        <LogoWithServices />
      </div>
    </motion.header>
  );
};

export default Header;

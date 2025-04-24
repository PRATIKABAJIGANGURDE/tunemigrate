
import { motion } from "framer-motion";
import { logoAnimation } from "@/lib/motionVariants";
import LogoWithServices from "./LogoWithServices";

const Header = () => {
  return (
    <motion.header 
      className="flex items-center justify-center w-full pt-10 pb-6"
      initial="hidden"
      animate="visible"
      variants={logoAnimation}
    >
      <LogoWithServices />
    </motion.header>
  );
};

export default Header;

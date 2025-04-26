
import { motion } from "framer-motion";
import { logoAnimation } from "@/lib/motionVariants";
import LogoWithServices from "./LogoWithServices";
import HomeLogoWithServices from "./HomeLogoWithServices";
import { useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <motion.header 
      className="flex items-start justify-start w-full pt-10 pb-6 px-6"
      initial="hidden"
      animate="visible"
      variants={logoAnimation}
    >
      {isHomePage ? <HomeLogoWithServices /> : <LogoWithServices />}
    </motion.header>
  );
};

export default Header;


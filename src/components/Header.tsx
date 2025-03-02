
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
          {/* YouTube Logo */}
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.4985 6.49C23.3663 6.01903 23.1142 5.59158 22.7669 5.25205C22.4196 4.91253 21.9878 4.67573 21.515 4.57C19.643 4.19 12.1138 4.19 12.1138 4.19C12.1138 4.19 4.58455 4.19 2.71255 4.57C2.23979 4.67573 1.80798 4.91253 1.46069 5.25205C1.1134 5.59158 0.861365 6.01903 0.729151 6.49C0.346733 8.41286 0.158025 10.3631 0.165351 12.3175C0.158025 14.2719 0.346733 16.2221 0.729151 18.145C0.861365 18.616 1.1134 19.0434 1.46069 19.383C1.80798 19.7225 2.23979 19.9593 2.71255 20.065C4.58455 20.445 12.1138 20.445 12.1138 20.445C12.1138 20.445 19.643 20.445 21.515 20.065C21.9878 19.9593 22.4196 19.7225 22.7669 19.383C23.1142 19.0434 23.3663 18.616 23.4985 18.145C23.8809 16.2221 24.0696 14.2719 24.0623 12.3175C24.0696 10.3631 23.8809 8.41286 23.4985 6.49ZM9.72055 15.895V8.74L16.0745 12.3175L9.72055 15.895Z" fill="#FF0000"/>
            </svg>
          </div>
          <motion.div 
            className="h-0.5 w-8 bg-gradient-to-r from-youtube to-spotify"
            initial={{ width: 0 }}
            animate={{ width: "2rem" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
          {/* Spotify Logo */}
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z"/>
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

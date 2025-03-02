
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
             <path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8Zm107.7 365.5c-4.2 7-13.3 9.3-20.5 5.2-56.2-34.4-126.9-42.1-210.5-23-8 1.8-15.7-3.5-17.5-11.4-1.8-8 3.4-15.7 11.3-17.6 91.9-20.1 169.6-11.3 232.4 26.1 7 4.2 9.3 13.3 5.1 20.7Zm29.1-59.3c-5.2 8.4-16.3 11-24.7 5.7-64.3-39.8-162.6-51.3-239.3-28.1-9.5 2.8-19.5-2.8-22.3-12.2-2.8-9.5 2.7-19.5 12.2-22.3 85.8-25.4 191.7-13.1 264.5 33.1 8.3 5.1 10.9 16.2 5.6 23.8Zm2.2-60.4c-77.6-47.5-205.6-51.9-277.1-28.5-11.2 3.6-23.3-2.6-26.8-13.8-3.6-11.2 2.6-23.3 13.8-26.9 81.5-26.1 219.7-21.2 305.9 32.5 10 6.1 13.2 19.2 7.1 29.2-5.9 9.9-19.1 13.1-29.3 7.5Z"/>
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

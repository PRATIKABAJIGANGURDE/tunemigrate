
import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, Music2, ArrowRightLeft, PlayCircle } from "lucide-react";

const ToolCard = ({ title, description, icon: Icon, link }: { 
  title: string; 
  description: string; 
  icon: React.ElementType;
  link: string;
}) => (
  <motion.div
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Link to={link}>
      <Card className="p-4 md:p-6 h-full hover:shadow-md transition-all duration-300 cursor-pointer border-primary/10">
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
          <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </div>
        <h3 className="text-base md:text-lg font-playfair font-semibold mb-1 md:mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </Card>
    </Link>
  </motion.div>
);

const Tools = () => {
  const tools = [
    {
      title: "Playlist Converter",
      description: "Convert your playlists between different music streaming platforms seamlessly.",
      icon: ArrowRightLeft,
      link: "/app"
    },
    {
      title: "Music Library Transfer",
      description: "Transfer your entire music library across platforms with ease.",
      icon: Music2,
      link: "#"
    },
    {
      title: "Playlist Analyzer",
      description: "Get insights about your music taste and playlist statistics.",
      icon: PlayCircle,
      link: "#"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        <Header />
        
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-4 font-playfair">Our Tools</h1>
          <p className="text-lg md:text-xl text-muted-foreground px-2">
            Discover our suite of music management tools designed to enhance your music experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-16">
          {tools.map((tool, index) => (
            <ToolCard key={index} {...tool} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tools;

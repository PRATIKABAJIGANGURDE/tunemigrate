import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Music2, ArrowRightLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div 
    className="flex flex-col items-start p-6 rounded-xl border border-border bg-white shadow-sm hover:shadow-md transition-all duration-300"
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-playfair font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

const testimonials = [
  {
    name: "Alex Johnson",
    title: "Music Producer",
    content: "TuneMigrate made it incredibly easy to move my playlists from YouTube to Spotify. Saved me hours of manual work!"
  },
  {
    name: "Sarah Williams",
    title: "Playlist Curator",
    content: "I manage dozens of playlists and this tool has become essential in my workflow. The matching accuracy is impressive."
  },
  {
    name: "Michael Chen",
    title: "Podcast Host",
    content: "Finally found a solution that actually works! The interface is intuitive and the conversion process is seamless."
  }
];

const Landing = () => {
  const featuredTools = [
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
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Navigation */}
      <nav className="container mx-auto py-6 px-4 flex items-center justify-between">
        <div className="flex-1">
          <Header />
        </div>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link to="/app">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 font-playfair">
            Seamlessly Transfer<br />
            <span className="text-gradient">Your Music Libraries</span><br /> 
            Across Platforms
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Effortlessly move your playlists between different music streaming services with just a few clicks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/app">Start Migrating <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#how-it-works">How It Works <ChevronRight className="ml-1 h-4 w-4" /></a>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary/5 border-y border-primary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl font-bold text-primary mb-2 font-playfair">1M+</h3>
              <p className="text-muted-foreground">Playlists Converted</p>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl font-bold text-primary mb-2 font-playfair">10M+</h3>
              <p className="text-muted-foreground">Songs Matched</p>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl font-bold text-primary mb-2 font-playfair">98%</h3>
              <p className="text-muted-foreground">Match Accuracy</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 font-playfair">Our Tools</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our powerful tools designed to enhance your music experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {featuredTools.map((tool, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link to={tool.link}>
                <Card className="p-6 h-full hover:shadow-md transition-all duration-300 cursor-pointer border-primary/10">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <tool.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-playfair font-semibold mb-2">{tool.title}</h3>
                  <p className="text-muted-foreground">{tool.description}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline" asChild>
            <Link to="/tools">
              View All Tools <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-primary/5 border-y border-primary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 font-playfair">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of music lovers who've simplified their playlist migration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-500">★</span>
                    ))}
                  </div>
                  <p className="text-foreground mb-6 flex-grow">{testimonial.content}</p>
                  <div className="mt-auto">
                    <h4 className="font-semibold font-playfair">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Service Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 font-playfair">100% Free Service</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            TuneMigrate is completely free with no hidden costs
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="border border-border">
            <CardContent className="p-6">
              <div className="mb-6 text-center">
                <h3 className="text-xl font-bold mb-2 font-playfair">Free Forever</h3>
                <p className="text-3xl font-bold font-playfair">$0<span className="text-base font-normal text-muted-foreground">/forever</span></p>
                <p className="text-muted-foreground mt-2">Powered by unobtrusive ads</p>
              </div>
              
              <ul className="space-y-3 mb-8 max-w-md mx-auto">
                {[
                  "Unlimited playlist conversions", 
                  "Advanced AI matching", 
                  "Quick support",
                  "No account required",
                  "Fast processing"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="text-center">
                <Button className="w-60" asChild>
                  <Link to="/app">
                    Start Converting Now
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 font-playfair">Ready to Transfer Your Music?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already simplified their music migration
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/app">Start Converting Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-left">
            <Header />
          </div>
          <div className="text-center md:text-right text-sm text-muted-foreground">
            <p>© 2023 TuneMigrate. All rights reserved.</p>
            <div className="mt-2">
              <a href="#" className="hover:text-primary mr-4">Privacy Policy</a>
              <a href="#" className="hover:text-primary mr-4">Terms of Service</a>
              <a href="#" className="hover:text-primary">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

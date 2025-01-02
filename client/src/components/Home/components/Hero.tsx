import React from "react";
import { motion } from "framer-motion";

const HeroSection: React.FC = () => {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.5, ease: "easeOut" },
    }),
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.section
      className="bg-white text-center py-12"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={containerVariants}
    >
      {/* Animated Headline */}
      <motion.div
        className="container mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <video
          title="Where work happens"
          className="max-h-16 mx-auto mb-8"
          autoPlay
          muted
          loop
          playsInline
          src="./header.mp4"
        ></video>
      </motion.div>

      {/* Call-to-Action Buttons */}
      <motion.div
        className="container mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex justify-center space-x-4 mb-8">
          <motion.button
            className="bg-brand text-white px-6 py-3 rounded-md font-medium shadow hover:bg-brand-dark transition"
            custom={0}
            variants={buttonVariants}
          >
            Get Started
          </motion.button>
          <motion.button
            className="bg-transparent border-2 border-brand text-brand px-6 py-3 rounded-md font-medium shadow hover:bg-brand hover:text-white transition"
            custom={1}
            variants={buttonVariants}
          >
            Find Your Subscription
          </motion.button>
        </div>
        <p className="text-neutral-500 text-sm">
          Our platform is free to try for as long as you like.
        </p>
      </motion.div>

      {/* Organization Logos */}
      <motion.div
        className="container mx-auto my-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex justify-center space-x-6 items-center">
          {[
            "https://imedia.sgp1.digitaloceanspaces.com/emiac/2021/06/MSFTC-768x320.png",
            "https://imedia.sgp1.digitaloceanspaces.com/emiac/2021/06/phonepe-768x320.png",
            "https://imedia.sgp1.digitaloceanspaces.com/emiac/2021/06/icici-2-1-768x320.png",
            "https://imedia.sgp1.digitaloceanspaces.com/emiac/2021/06/unacademy-4-768x320.png",
            "https://imedia.sgp1.digitaloceanspaces.com/emiac/2021/06/myntra_logo-freelogovectors.net_-768x251.png",
            "https://imedia.sgp1.digitaloceanspaces.com/emiac/2021/06/Untitled-4_0010_2560px-Paytm_Logo_standalone.svg_-768x320.png",
          ].map((logo, index) => (
            <motion.img
              key={index}
              src={logo}
              alt={`Logo ${index + 1}`}
              className="h-8"
              variants={logoVariants}
              custom={index}
            />
          ))}
        </div>
      </motion.div>

      {/* Large Video Showcase */}
      <motion.div
        className="container mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <video
          height="544"
          width="900"
          className="mx-auto rounded-md shadow-lg"
          title="Team discussing work in the Slack app"
          autoPlay
          muted
          loop
          playsInline
          src="./demo.webm"
        ></video>
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;

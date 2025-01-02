import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const videoCards = [
  {
    id: 1,
    title: "OpenAI",
    description: "How OpenAI connects with customers and expands ChatGPT with Slack.",
    videoSrc: "/card2.webm",
    thumbnail: "/thumb1.png",
  },
  {
    id: 2,
    title: "Spotify",
    description: "How Spotify boosted ad sales and streamlined operations with Slack.",
    videoSrc: "/card3.mp4",
    thumbnail: "/thumb2.png",
  },
  {
    id: 3,
    title: "IBM",
    description: "IBM shifted into a higher gear of productivity by partnering with Slack.",
    videoSrc: "/card1.webm",
    thumbnail: "/thumb3.png",
  },
  {
    id: 4,
    title: "Ari Bikes",
    description: "Ari Bikes uses Slack as a creative space for collaboration.",
    videoSrc: "/card.mp4",
    thumbnail: "/thumb.png",
  },
];

const VideoCardSection = () => {
  const [activeCardId, setActiveCardId] = useState<number>(1);

  const handleMouseEnter = (id: number) => {
    setActiveCardId(id);
  };

  return (
    <motion.section
      className="py-20 "
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto text-center font-mediumt">
        <motion.h2
          className="text-4xl font-bold mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          The most innovative companies grow their business with EMIAC
        </motion.h2>
        <motion.div
          className="flex justify-center items-center space-x-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 },
            },
          }}
        >
          {videoCards.map((card) => (
            <motion.div
              key={card.id}
              className={`relative overflow-hidden rounded-lg cursor-pointer shadow-lg transition-all duration-500 ${activeCardId === card.id
                  ? "w-[600px] h-[300px]"
                  : "w-[200px] h-[300px]"
                }`}
              onMouseEnter={() => handleMouseEnter(card.id)}
              style={{
                backgroundImage: `url(${card.thumbnail})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
            >
              {/* Overlay for collapsed cards */}
              <motion.div
                className="absolute inset-0 bg-black bg-opacity-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCardId === card.id ? 0 : 0.6 }}
                transition={{ duration: 0.3 }}
              />

              {/* Video */}
              <AnimatePresence>
                {activeCardId === card.id && (
                  <motion.video
                    key={card.videoSrc}
                    src={card.videoSrc}
                    autoPlay
                    muted
                    loop
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 120,
                      damping: 15,
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Content */}
              <div className="absolute bottom-4 left-4 text-left text-white z-10">
                <h3 className="text-lg font-bold">{card.title}</h3>
                {activeCardId === card.id && (
                  <motion.p
                    className="text-sm mt-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 120,
                      damping: 15,
                    }}
                  >
                    {card.description}
                  </motion.p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default VideoCardSection;

import React from "react";
import { motion } from "framer-motion";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

const Card = ({ card, index }: { card: any; index: number }) => {
  return (
    <div className="bg-brand text-white rounded-2xl p-6 shadow-lg" key={index}>
      <img
        src={card.src}
        alt={card.title}
        className="w-full h-64 object-cover rounded-lg mb-4"
      />
      <h3 className="text-lg font-bold mb-2">{card.title}</h3>
      <p className="text-sm text-gray-300">{card.category}</p>
      <div className="mt-4">{card.content}</div>
    </div>
  );
};

const Carousel = ({ items }: { items: React.ReactNode[] }) => {
  return (
    <div className="flex space-x-4 overflow-x-auto py-4">
      {items.map((item, index) => (
        <motion.div
          key={index}
          className="flex-shrink-0 w-80"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={transition}
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
};

const CardsCarousel = () => {
  const cards = data.map((card, index) => (
    <Card key={index} card={card} index={index} />
  ));

  return (
    <div className="bg-brand text-white py-20">
      <h2 className="text-center text-3xl md:text-5xl font-bold mb-10">
        Get to know your iSad.
      </h2>
      <Carousel items={cards} />
    </div>
  );
};

const DummyContent = () => {
  return (
    <>
      {[...new Array(3)].map((_, index) => (
        <div
          key={index}
          className="bg-gray-800 text-gray-200 p-8 rounded-3xl mb-4"
        >
          <p className="text-base md:text-lg font-semibold">
            The first rule of Apple club is that you boast about Apple club. Keep a
            journal, jot down a grocery list, and take amazing class notes.
          </p>
          <img
            src="https://assets.aceternity.com/macbook.png"
            alt="Macbook mockup"
            className="w-full h-64 object-contain mt-4"
          />
        </div>
      ))}
    </>
  );
};

const data = [
  {
    category: "Artificial Intelligence",
    title: "You can do more with AI.",
    src: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Productivity",
    title: "Enhance your productivity.",
    src: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Product",
    title: "Launching the new Apple Vision Pro.",
    src: "https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80&w=2333&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Product",
    title: "Maps for your iPhone 15 Pro Max.",
    src: "https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80&w=2515&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "iOS",
    title: "Photography just got better.",
    src: "https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80&w=2793&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Hiring",
    title: "Hiring for a Staff Software Engineer",
    src: "https://images.unsplash.com/photo-1511984804822-e16ba72f5848?q=80&w=2048&auto=format&fit=crop",
    content: <DummyContent />,
  },
];

export default CardsCarousel;

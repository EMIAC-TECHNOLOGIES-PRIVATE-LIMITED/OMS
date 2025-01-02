import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'What is Content Marketing?',
    answer: 'Content marketing is a strategy focused on creating and distributing valuable, relevant, and consistent content to attract and retain a clearly defined audience and drive profitable customer action.'
  },
  {
    question: 'How does guest posting help SEO?',
    answer: "Guest posting allows you to publish content on authoritative websites, earning quality backlinks, increasing your site's visibility, and improving domain authority in search engine rankings."
  },
  {
    question: 'What are the benefits of link building?',
    answer: "Link building improves your website's search engine ranking, drives referral traffic, and establishes your site as a credible source of information in your niche."
  },
  {
    question: 'How long does it take to see results from SEO strategies?',
    answer: "SEO strategies typically take 3 to 6 months to show significant results, depending on your website's current status, competition, and the strategies implemented."
  }
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div className="bg-white text-black p-8 md:p-16 rounded-2xl shadow-2xl">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="md:w-1/2 flex flex-col justify-start items-start space-y-6 md:sticky md:top-16 h-fit">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold tracking-tight"
          >
            FAQ
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600"
          >
            Find answers to commonly asked questions about content marketing and SEO strategies.
          </motion.p>
        </div>
        
        <div className="md:w-1/2 space-y-6">
          {faqData.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                border-b border-gray-200 pb-6
                transform transition-all duration-300
                ${hoveredIndex === index ? 'scale-[1.02]' : 'scale-100'}
              `}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className="flex justify-between items-center cursor-pointer group"
                onClick={() => toggleFAQ(index)}
              >
                <h2 className="text-xl font-semibold pr-8 group-hover:text-brand-light transition-colors duration-300">
                  {item.question}
                </h2>
                <motion.div
                  animate={{ 
                    rotate: openIndex === index ? 45 : 0,
                    scale: hoveredIndex === index ? 1.2 : 1
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="text-2xl font-bold text-brand-light"
                >
                  +
                </motion.div>
              </div>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ 
                      opacity: 1, 
                      height: 'auto',
                      transition: { duration: 0.3 }
                    }}
                    exit={{ 
                      opacity: 0, 
                      height: 0,
                      transition: { duration: 0.2 }
                    }}
                    className="mt-4 text-lg text-gray-600 leading-relaxed"
                  >
                    {item.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
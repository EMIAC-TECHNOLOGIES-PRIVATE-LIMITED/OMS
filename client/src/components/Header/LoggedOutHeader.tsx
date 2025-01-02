import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = {
  Pricing: [
    { title: "Basic Plan", description: "Ideal for small businesses.", href: "" },
    { title: "Pro Plan", description: "Advanced features for growing teams.", href: "" },
    { title: "Enterprise Plan", description: "Custom solutions for large organizations.", href: "" },
  ],
  "Learn SEO": [
    { title: "SEO Basics", description: "Kickstart your SEO journey.", href: "" },
    { title: "Advanced SEO", description: "Deep dive into expert techniques.", href: "" },
    { title: "SEO Tools", description: "Explore essential optimization tools.", href: "" },
  ],
  "White Label SEO": [
    { title: "Reseller Program", description: "Expand services under your own brand.", href: "" },
    { title: "Custom Reports", description: "Provide branded reports to your clients.", href: "" },
    { title: "Dedicated Support", description: "Prioritized assistance and training.", href: "" },
  ],
  Affiliates: [
    { title: "Join Program", description: "Earn by promoting our platform.", href: "" },
    { title: "Marketing Materials", description: "Access resources to advertise effectively.", href: "" },
    { title: "Payout Details", description: "Learn how earnings are calculated.", href: "" },
  ],
};

const LoggedOutHeader: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleMouseEnterMenu = (menu: string) => {
    setActiveMenu(menu);
  };

  const handleMouseLeaveAll = () => {
    setActiveMenu(null);
  };

  return (
    <motion.header
      className="bg-white text-black shadow-md sticky top-0 z-50 rounded-full"
      style={{ maxWidth: "90%", margin: "0 auto", padding: "10px" }}
      initial={{ y: -100, opacity: 0 }} // Start position
      animate={{ y: 0, opacity: 1 }} // End position
      transition={{ duration: 0.5, ease: "easeOut" }} // Animation duration and easing
    >
      <div className="container mx-auto flex items-center justify-between p-4">
        <a href="/" className="flex items-center space-x-2">
          <img
            src="./image.png"
            alt="Brand Logo"
            className="h-8 w-8"
          />
          <span className="font-bold text-lg">EMIAC Technologies</span>
        </a>

        <div
          className="relative"
          onMouseLeave={handleMouseLeaveAll}
        >
          <nav className="flex space-x-6 font-medium">
            {Object.keys(menuItems).map((menuTitle) => (
              <div
                key={menuTitle}
                onMouseEnter={() => handleMouseEnterMenu(menuTitle)}
                className="relative"
              >
                <button className="flex items-center space-x-1 hover:text-gray-500 transition">
                  <span>{menuTitle}</span>
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    animate={{ rotate: activeMenu === menuTitle ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 9l6 6 6-6"
                    />
                  </motion.svg>
                </button>
              </div>
            ))}
          </nav>

          <div
            onMouseEnter={() => setActiveMenu(activeMenu)}
            className={`
              absolute left-1/2 top-full mt-1
              transform -translate-x-1/2
              w-[400px] bg-white text-black shadow-lg rounded-md
              ${activeMenu ? "block" : "hidden"}
            `}
          >
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeMenu && (
                  <motion.div
                    key={activeMenu}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ul className="space-y-4">
                      {menuItems[activeMenu as keyof typeof menuItems].map(
                        (item, idx) => (
                          <li
                            key={idx}
                            className="hover:bg-neutral-100 rounded-lg p-4"
                          >
                            <a href={item.href} className="block">
                              <div className="font-medium">{item.title}</div>
                              <p className="text-sm text-neutral-500">
                                {item.description}
                              </p>
                            </a>
                          </li>
                        )
                      )}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex space-x-4">
          <a
            href="/login"
            className="px-4 py-2 border-2 border-brand text-brand font-medium rounded-md shadow hover:bg-gray-200 transition"
          >
            TALK TO SALES
          </a>
          <a
            href="/login"
            className="px-4 py-2 bg-brand text-white font-medium rounded-md shadow hover:bg-gray-700 transition"
          >
            GET STARTED
          </a>
        </div>
      </div>
    </motion.header>
  );
};

export default LoggedOutHeader;

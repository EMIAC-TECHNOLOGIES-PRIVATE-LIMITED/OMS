import { motion } from "framer-motion";

const PricingSection = () => {
  return (
    <motion.div
      className="bg-white py-16"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto text-center">
        {/* Headline */}
        <motion.h2
          className="text-3xl font-bold text-gray-900 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Tailored SEO Solutions for Every Business.
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          Choose the right plan to grow your business with expert SEO strategies, 
          content marketing, and organic traffic generation.
        </motion.p>

        {/* Pricing Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 },
            },
          }}
        >
          {[
            {
              title: "Starter",
              description: "Perfect for small businesses beginning their SEO journey.",
              features: [
                "✓ Basic SEO audit",
                "✓ Keyword research and optimization",
                "✓ On-page SEO for 5 pages",
                "✓ Monthly performance reports",
              ],
            },
            {
              title: "Growth",
              description: "For growing businesses ready to scale their organic presence.",
              features: [
                "✓ Everything in Starter, plus:",
                "✓ Content marketing strategy",
                "✓ Guest posting on DA 30+ websites",
                "✓ Advanced backlink building",
                "✓ Competitor analysis",
              ],
            },
            {
              title: "Pro",
              description:
                "Advanced solutions for established businesses and enterprises.",
              features: [
                "✓ Everything in Growth, plus:",
                "✓ Comprehensive SEO audit",
                "✓ High-quality guest posting on DA 50+ websites",
                "✓ Local SEO optimization",
                "✓ Advanced analytics and reporting",
              ],
            },
            {
              title: "Enterprise",
              description:
                "Customized SEO strategies for large-scale organizations.",
              features: [
                "✓ Everything in Pro, plus:",
                "✓ Dedicated SEO manager",
                "✓ International SEO optimization",
                "✓ Custom link-building campaigns",
                "✓ Priority support and consulting",
              ],
            },
          ].map((plan, index) => (
            <motion.div
              key={index}
              className="border rounded-lg p-6 shadow-lg"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {plan.title}
              </h3>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              <ul className="space-y-3 text-left text-gray-700">
                {plan.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Call-to-Action Buttons */}
        <motion.div
          className="mt-12 flex justify-center space-x-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          <button className="bg-brand text-white px-6 py-3 rounded-lg font-medium">
            Get Started
          </button>
          <button className="border-2 border-brand text-brand px-6 py-3 rounded-lg font-medium">
            Request a Consultation
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PricingSection;

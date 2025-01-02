import { motion, useTransform, useScroll } from "framer-motion";
import { useRef, FC } from "react";

type TextSectionProps = {
  title: string;
  content: string;
  highlight?: string;
  stat?: string;
};

type ImageSectionProps = {
  images: string[];
  colors: string[];
};

const textSections: TextSectionProps[] = [
  {
    title: "Content Strategy",
    content:
      "Elevate your brand with an effective content marketing strategy. Our SEO agency helps craft high-quality, optimized content to increase engagement and drive organic traffic to your site.",
    highlight: "3x",
    stat: "boost in website traffic for our clients within 6 months.",
  },
  {
    title: "Guest Posting",
    content:
      "Grow your authority and reach with premium guest posting. We connect you with high-authority websites to build backlinks and showcase your expertise effectively.",
    highlight: "92%",
    stat: "of clients experience significant SEO improvement through guest posting.",
  },
  {
    title: "Link Building",
    content:
      "Strengthen your SEO foundation with strategic link-building services. We ensure quality links from trusted sources to improve your website's rankings and credibility.",
    highlight: "80%",
    stat: "better ranking potential for clients who use our link-building services.",
  },
  {
    title: "Performance Insights",
    content:
      "Understand your growth metrics with in-depth analytics and performance reports. Our insights guide you in optimizing strategies for consistent, long-term results.",
    highlight: "60%",
    stat: "average increase in ROI for our content marketing clients.",
  },
];

const backgroundImages: string[] = ["./1.png", "./2.png", "./3.png", "./4.png"];
const overlayImages: string[] = ["./a.png", "./b.png", "./c.png", "./d.png"];
const colors: string[] = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12"];

const TextSection: FC<TextSectionProps> = ({
  title,
  content,
  highlight,
  stat,
}) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]);

  return (
    <motion.div
      ref={sectionRef}
      className="h-screen flex items-center"
      style={{ opacity, y }}
    >
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="text-4xl font-bold mb-6">{title}</h2>
        <p className="text-lg text-gray-700 mb-6">{content}</p>
        {highlight && (
          <div className="flex items-center">
            <span className="text-6xl font-bold text-brand mr-4">
              {highlight}
            </span>
            <span className="text-lg text-gray-700">{stat}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ImageSection: FC<ImageSectionProps> = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <div ref={sectionRef} className="h-[400vh]">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        <div className="relative flex w-full h-[90vmin]">
          {/* Overlay Images - Shifted more to the right */}
          <div className="relative w-[95vmin] h-[45vmin] self-center -right-32 z-10">
            {overlayImages.map((src, index) => {
              const visible = useTransform(
                scrollYProgress,
                [index * 0.25, (index + 0.5) * 0.25, (index + 1) * 0.25],
                [0, 1, 0]
              );
              return (
                <motion.img
                  key={src}
                  src={src}
                  alt={`Overlay ${index + 1}`}
                  className="absolute top-0 left-0 w-full h-full object-cover rounded-lg shadow-xl"
                  style={{ opacity: visible }}
                />
              );
            })}
          </div>

          {/* Background Images - Increased size by 50% */}
          <div className="relative w-[95vmin] h-[95vmin] -left-24">
            {backgroundImages.map((src, index) => {
              const visible = useTransform(
                scrollYProgress,
                [index * 0.25, (index + 0.5) * 0.25, (index + 1) * 0.25],
                [0, 1, 0]
              );
              return (
                <motion.img
                  key={src}
                  src={src}
                  alt={`Background ${index + 1}`}
                  className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                  style={{ opacity: visible }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const ParallaxSection: FC = () => {
  return (
    <div className="flex justify-center items-start mx-auto max-w-[1900px]">
      <div className="w-[40%] px-4">
        {textSections.map((section, index) => (
          <TextSection
            key={index}
            title={section.title}
            content={section.content}
            highlight={section.highlight}
            stat={section.stat}
          />
        ))}
      </div>
      <div className="w-[60%] px-4">
        <ImageSection images={[...backgroundImages, ...overlayImages]} colors={colors} />
      </div>
    </div>
  );
};

export default ParallaxSection;
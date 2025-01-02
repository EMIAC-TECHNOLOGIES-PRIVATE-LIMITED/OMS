import FAQSection from "./components/FAQ"
import ParallaxFeatureSection from "./components/Features"
import HeroSection from "./components/Hero"
import PricingSection from "./components/PriceCards"
import StatsSection from "./components/Stats"
import VideoCardSection from "./components/VideoCards"

function Home() {
  return (
    <>
      <HeroSection />
      <ParallaxFeatureSection />
      <VideoCardSection />
      <PricingSection />
      <StatsSection />
      <FAQSection />
    </>
  )
}

export default Home
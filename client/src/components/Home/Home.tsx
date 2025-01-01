import ParallaxFeatureSection from "./components/Features"
import HeroSection from "./components/Hero"
import StatsSection from "./components/Stats"
import VideoCardSection from "./components/VideoCards"

function Home() {
  return (
    <>
      <HeroSection />
      {/* <ParallaxFeatureSection /> */}
      <VideoCardSection />
      <StatsSection />
    </>
  )
}

export default Home
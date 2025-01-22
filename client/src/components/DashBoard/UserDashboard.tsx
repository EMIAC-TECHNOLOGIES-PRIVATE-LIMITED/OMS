import { authAtom } from "../../store/atoms/atoms";
import { useRecoilValue } from "recoil";
import { TypewriterEffectSmooth } from "../ui/typewriter-effect";
import { WobbleCard } from "../ui/wobble-card";
import { PinContainer } from "../ui/3d-pin";

import { PlayCircle } from "lucide-react";
import { InfiniteMovingCards } from "../ui/InfiniteMovingCards ";

function UserDashboard() {
  const auth = useRecoilValue(authAtom);
  const words = [
    { text: "Welcome back, " },
    { text: auth.userInfo?.name, className: "text-brand" },
    { text: " !", className: "text-brand" },
  ];

  const announcements = [
    {
      quote:
        "🚀 New Analytics Dashboard Launched! Explore deeper insights into website performance and traffic data with our new analytics dashboard.",
      name: "System Update",
      title: "January 2025",
    },
    {
      quote:
        "📢 Maintenance Scheduled: On Jan 20, 2025, scheduled maintenance may cause temporary unavailability of some features.",
      name: "Maintenance Alert",
      title: "January 2025",
    },
    {
      quote:
        "🎉 New Vendor Partnerships: We are excited to announce collaborations with premium guest posting platforms, expanding your options.",
      name: "Vendor Update",
      title: "January 2025",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
      {/* Header Section */}
      <header className="mb-8">
        <TypewriterEffectSmooth words={words} />
      </header>

      {/* Main Content Section */}
      <div className="grid grid-cols-3 gap-8">
        {/* Left Section */}
        <div className="col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
            {/* First Card */}
            <WobbleCard
              containerClassName="col-span-1 lg:col-span-2 h-full bg-pink-800 min-h-[500px] lg:min-h-[300px]"
              className=""
            >
              <div className="max-w-xs">
                <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                  Streamline Your Daily Tasks
                </h2>
                <p className="mt-4 text-left text-base/6 text-neutral-200">
                  Access a suite of powerful tools designed for day-to-day operations, such as price fetchers and domain sanitizers. Simplify your workflow and enhance team productivity.
                </p>
              </div>
              <img
                src="/demo1.png"
                width={500}
                height={500}
                alt="linear demo image"
                className="absolute -right-4 lg:-right-[20%] -top-12 filter -bottom-10 object-contain rounded-2xl"
              />
            </WobbleCard>

            {/* Second Card */}
            <WobbleCard containerClassName="col-span-1 min-h-[300px]">
              <h2 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                Beginner-Friendly Interface
              </h2>
              <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
                Navigate the app effortlessly with an intuitive design and user-friendly interface, crafted to cater to all skill levels across your organization.
              </p>
            </WobbleCard>

            {/* Third Card */}
            <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-blue-900 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
              <div className="max-w-sm">
                <h2 className="max-w-sm md:max-w-lg text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                  Advanced Nested Filtering
                </h2>
                <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
                  Utilize robust filtering functionalities to manage, sort, and analyze data seamlessly. Achieve unparalleled precision and speed for every query.
                </p>
              </div>
              <img
                src="/demo2.png"
                width={500}
                height={500}
                alt="linear demo image"
                className="absolute -right-4 lg:-right-[9%] -top-10 filter -bottom-10 object-contain rounded-2xl"
              />
            </WobbleCard>
          </div>
        </div>

        {/* Right Section: Announcements */}
        <div className="p-6 bg-slate-200 rounded-xl shadow-md h-full">
          <h2 className="text-3xl font-bold text-brand-dark">Announcements 🚀</h2>
          <div className="mt-4 space-y-4">
            <InfiniteMovingCards
              items={announcements}
              direction="right"
              speed="slow"
            />
          </div>
          <div className="mt-4 scale-95">
            <PinContainer title="Play" href="">
              <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[20rem] h-[20rem] ">
                <h3 className="max-w-xs !pb-2 !m-0 font-bold text-base text-slate-100">
                  App Tour
                </h3>
                <div className="text-base !m-0 !p-0 font-normal">
                  <span className="text-slate-500">
                    A quick tour of the app to get you started.
                  </span>
                </div>
                <div className="flex flex-1 w-full rounded-lg mt-4 bg-gradient-to-br from-brand-dark via-brand-light to-brand">
                  <PlayCircle className="w-12 h-12 text-white m-auto" />
                </div>
              </div>
            </PinContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;

import React from "react";

const HeroSection: React.FC = () => {
    return (
        <section className="bg-white text-center py-12">
            {/* Animated Headline */}
            <div className="container mx-auto">
                <video
                    title="Where work happens"
                    className="max-h-16 mx-auto mb-8"
                    autoPlay
                    muted
                    loop
                    playsInline
                    src="./header.mp4"
                >
                </video>
            </div>

            {/* Call-to-Action Buttons */}
            <div className="container mx-auto">
                <div className="flex justify-center space-x-4 mb-8">
                    <button className="bg-brand text-white px-6 py-3 rounded-md font-medium shadow hover:bg-brand-dark transition">
                        Get Started
                    </button>
                    <button className="bg-transparent border-2 border-brand text-brand px-6 py-3 rounded-md font-medium shadow hover:bg-brand hover:text-white transition">
                        Find Your Subscription
                    </button>
                </div>
                <p className="text-neutral-500 text-sm">
                    Our platform is free to try for as long as you like.
                </p>
            </div>

            {/* Organization Logos */}
            <div className="container mx-auto my-12">
                <div className="flex justify-center space-x-6 items-center">
                    <img
                        src="https://imedia.sgp1.digitaloceanspaces.com/emiac/2021/06/MSFTC-768x320.png"
                        alt="Microsoft"
                        className="h-8"
                    />
                    <img
                        src="https://imedia.sgp1.digitaloceanspaces.com/emiac/2021/06/phonepe-768x320.png"
                        alt="PhonePe"
                        className="h-8"
                    />
                    <img
                        src="https://imedia.sgp1.digitaloceanspaces.com/emiac/2021/06/icici-2-1-768x320.png"
                        alt="ICICI Bank"
                        className="h-8"
                    />
                    <img
                        src="https://imedia.sgp1.digitaloceanspaces.com/emiac/2021/06/unacademy-4-768x320.png"
                        alt="Unacademy"
                        className="h-8"
                    />
                    <img
                        src="https://imedia.sgp1.digitaloceanspaces.com/emiac/2021/06/myntra_logo-freelogovectors.net_-768x251.png"
                        alt="Myntra"
                        className="h-8"
                    />
                    <img
                        src="https://imedia.sgp1.digitaloceanspaces.com/emiac/2021/06/Untitled-4_0010_2560px-Paytm_Logo_standalone.svg_-768x320.png"
                        alt="Paytm"
                        className="h-8"
                    />
                </div>
            </div>

            {/* Large Video Showcase */}
            <div className="container mx-auto">
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
                >
                </video>
            </div>
        </section>
    );
};

export default HeroSection;

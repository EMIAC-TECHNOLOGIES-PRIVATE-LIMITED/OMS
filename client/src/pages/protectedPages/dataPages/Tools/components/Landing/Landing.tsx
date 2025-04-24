import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { IndianRupee, Copy, Computer, Link, MailIcon, Cable, Trash2 } from "lucide-react";


const tools = [
    {
        title: "Duplicate Domains Lookup",
        description: "Check if your domains are already present in our database.",
        link: "/tools/duplicate-website-checker",
        icon: Copy,
        activeToolKey: "_tools_1"
    },
    {
        title: "Domain Price Lookup",
        description: "Find pricing information for domains across vendors.",
        link: "/tools/price-lookup",
        icon: IndianRupee,
        activeToolKey: "_tools_2"
    },
    {
        title: "URL Sanitizer",
        description: "Convert URLs to a standardized format.",
        link: "/tools/url-sanitizer",
        icon: Link,
        activeToolKey: "_tools_4"
    },
    {
        title: "Domain Vendor Lookup",
        description: "Retrieve vendor information for your domains.",
        link: "/tools/vendor-lookup",
        icon: Computer,
        activeToolKey: "_tools_3"
    }, {
        title: "Category Links Fetcher",
        description: "Fetch category links from a given URL.",
        link: "/tools/category-links-fetcher",
        icon: Cable,
        activeToolKey: "_tools_5"
    }
    , {
        title: "Add Trash Domains",
        description: "Add Trash Domains to database",
        link: "/tools/add-trash-domains",
        icon: Trash2,
        activeToolKey: "_tools_6"
    }
];

export function Landing(props: {
    setActiveToolKey: (activeToolKey: string) => void
}) {
    return (
        <div className="p-8">
            {/* Main Container */}
            <div className="flex flex-col items-center max-w-screen-2xl mx-auto">
                {/* Contained Background Elements */}
                <div className="relative w-full">
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand/20 rounded-full mix-blend-multiply filter blur-2xl animate-blob" />
                    <div className="absolute -bottom-6 right-0 w-96 h-96 bg-brand-dark/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
                </div>

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-4 mb-12 relative"
                >
                    <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl text-brand-dark bg-clip-text text-transparent bg-gradient-to-r from-brand to-brand-dark">
                        EveryDay Handy Tools
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        A collection of highly useful tools for your day-to-day tasks.
                    </p>
                </motion.div>

                <Separator className="w-1/2 mb-12" />

                {/* Marquee Container */}
                <div className="w-full overflow-hidden mb-12 relative">
                    {/* Add a gradient overlay on the sides */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

                    {/* Double marquee for seamless loop */}
                    <div className="flex gap-6 py-4">
                        <motion.div
                            className="flex gap-6 shrink-0"
                            initial={{ x: 0 }}
                            animate={{ x: "-50%" }}
                            transition={{
                                duration: 30,
                                repeat: Infinity,
                                ease: "linear",
                                repeatType: "loop",
                            }}
                        >
                            {/* First set of cards */}
                            {tools.map((tool) => (
                                <Card
                                    key={`first-${tool.activeToolKey}`}
                                    className="w-80 flex-shrink-0 flex flex-col bg-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <CardHeader className="space-y-1">
                                        <CardTitle className="text-xl font-semibold">
                                            {tool.title}
                                        </CardTitle>
                                        <CardDescription className="text-sm text-muted-foreground">
                                            {tool.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex items-center justify-center p-6">
                                        <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center">
                                            <tool.icon className="h-8 w-8 text-brand" />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-4">
                                        <Button
                                            variant="brand"
                                            className="w-full hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"

                                        >
                                            Know More
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                            {/* Second set of cards for seamless loop */}
                            {tools.map((tool) => (
                                <Card
                                    key={`second-${tool.activeToolKey}`}
                                    className="w-80 flex-shrink-0 flex flex-col bg-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <CardHeader className="space-y-1">
                                        <CardTitle className="text-xl font-semibold">
                                            {tool.title}
                                        </CardTitle>
                                        <CardDescription className="text-sm text-muted-foreground">
                                            {tool.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex items-center justify-center p-6">
                                        <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center">
                                            <tool.icon className="h-8 w-8 text-brand" />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-4">
                                        <Button
                                            variant="brand"
                                            className="w-full hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
                                            onClick={() => props.setActiveToolKey(tool.activeToolKey)}
                                        >
                                            Explore
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </motion.div>
                    </div>
                </div>

                <Separator className="w-1/2 mb-12" />

                {/* Call-to-Action Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-center space-y-6 relative"
                >
                    <div className="space-y-4">
                        <h2 className="text-2xl font-medium text-gray-800">
                            Need any specific tool?
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-xl">
                            The dev team is just one mail away from crafting specified solutions for your needs.
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => window.location.href = "mailto:sujeet@emiactech.com"}
                        className="hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
                    >
                        <MailIcon className="h-6 w-6 mr-2" />
                        Contact Us
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
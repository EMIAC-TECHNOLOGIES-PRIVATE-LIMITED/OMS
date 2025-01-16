import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { IndianRupee, Copy, Computer, Link, MailIcon, } from "lucide-react";

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
    }
];

export function Landing(props: {
    setActiveToolKey: (activeToolKey: string) => void
}) {
    return (
        <div className="relative overflow-clip  max-w-screen-2xl bg-gradient-to-r from-gray-50 to-white">
            {/* Decorative Background Shapes */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand opacity-20 rounded-full mix-blend-multiply filter blur-2xl animate-blob" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-dark opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

            <div className="relative p-8 space-y-12">
                {/* Header Section */}
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 1,
                    }}
                    className=""
                >

                <div className="text-center space-y-4 mb-8">
                    <h1 className="scroll-m-20 text-5xl font-extrabold tracking-tight lg:text-6xl text-brand-dark bg-clip-text text-transparent bg-gradient-to-r from-brand to-brand-dark">
                        EveryDay Handy Tools
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        A collection of highly useful tools for your day-to-day tasks.
                    </p>
                </div>

                <Separator className="mx-auto w-1/2" />

                {/* Interactive Tools Display */}
                <div className="overflow-clip">
                    <motion.div
                        className="flex"
                        initial={{ x: '0%' }}
                        animate={{ x: '-50%' }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 20,
                                ease: "linear",
                            },
                        }}
                    >
                        {[...tools, ...tools].map((tool, index) => (
                            <motion.div
                                key={`${tool.title}-${index}`}
                                className="flex-shrink-0 w-64 mx-4"
                            >
                                <Card className="flex flex-col w-full shadow-lg hover:shadow-2xl transition-shadow  duration-300 max-h-80">
                                    <CardHeader className="space-y-1">
                                        <CardTitle className="text-xl font-semibold">
                                            {tool.title}
                                        </CardTitle>
                                        <CardDescription className="text-sm text-muted-foreground">
                                            {tool.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex items-center justify-center">
                                        {/* Placeholder for icons or illustrations */}
                                        <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center">
                                            <tool.icon className="h-8 w-8 text-brand" />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-4">
                                        <Button variant="brand" className="w-full" onClick={() => props.setActiveToolKey(tool.activeToolKey)}>
                                            Explore
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                <Separator className="mx-auto w-1/2" />

                {/* Call-to-Action Section */}
                <motion.div
                    className="text-center mt-12 space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                >
                    <p className="text-2xl font-medium">
                        Need any specific tool? Write to us!
                    </p>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        The dev team is just one mail away from crafting specified solutions for your needs.
                    </p>
                    <Button variant="secondary" size="lg" onClick={() => window.location.href = "mailto:sujeet@emiactech.com"}>
                        <MailIcon className="h-6 w-6 mr-2" />
                        Contact Us
                    </Button>
                </motion.div>
                </motion.div>
            </div>
        </div>
    );
}


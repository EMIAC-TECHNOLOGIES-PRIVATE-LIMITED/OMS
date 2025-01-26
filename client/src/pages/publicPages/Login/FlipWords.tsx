import  { FC, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";


function cn(...classes: Array<string | undefined>) {
    return classes.filter(Boolean).join(" ");
}

interface FlipWordsProps {
    words: string[];
    duration?: number;
    className?: string;
}

export const FlipWords: FC<FlipWordsProps> = ({
    words,
    duration = 3000,
    className,
}) => {
    const [currentWord, setCurrentWord] = useState<string>(
        words && words.length > 0 ? words[0] : ""
    );
    const [isAnimating, setIsAnimating] = useState<boolean>(false);

    const startAnimation = useCallback(() => {
        // Safeguard against empty array.
        if (!words || words.length === 0) return;
        const currentIndex = words.indexOf(currentWord);
        const nextIndex = currentIndex + 1;
        const nextWord = words[nextIndex] || words[0];
        setCurrentWord(nextWord);
        setIsAnimating(true);
    }, [currentWord, words]);

    useEffect(() => {
        if (!isAnimating) {
            const timer = setTimeout(() => {
                startAnimation();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isAnimating, duration, startAnimation]);

    return (
        <AnimatePresence
            onExitComplete={() => {
                setIsAnimating(false);
            }}
        >
            <motion.div
                // key is important so the AnimatePresence knows which element to animate
                key={currentWord}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 10 }}
                exit={{
                    opacity: 0,
                    y: -40,
                    x: 40,
                    filter: "blur(8px)",
                    scale: 2,
                    position: "absolute",
                }}
                className={cn(
                    "z-10 inline-block relative text-left text-white dark:text-neutral-100 px-2",
                    className
                )}
            >
                {currentWord.split(" ").map((wordItem, wordIndex) => (
                    <motion.span
                        key={`${wordItem}-${wordIndex}`}
                        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{
                            delay: wordIndex * 0.3,
                            duration: 0.3,
                        }}
                        className="inline-block whitespace-nowrap"
                    >
                        {wordItem.split("").map((letter, letterIndex) => (
                            <motion.span
                                key={`${wordItem}-${letterIndex}`}
                                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                transition={{
                                    delay: wordIndex * 0.3 + letterIndex * 0.05,
                                    duration: 0.2,
                                }}
                                className="inline-block"
                            >
                                {letter}
                            </motion.span>
                        ))}
                        {/* Preserving space between words */}
                        <span className="inline-block">&nbsp;</span>
                    </motion.span>
                ))}
            </motion.div>
        </AnimatePresence>
    );
};

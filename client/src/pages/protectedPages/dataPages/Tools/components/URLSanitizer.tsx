import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ClipboardCopy, AlertCircle, Eraser } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

function URLSanitizer() {
    const [enteredText, setEnteredText] = useState<string>("");
    const [sanitizedURLs, setSanitizedURLs] = useState<string>("");
    const [invalidEntries, setInvalidEntries] = useState<string>("");

    const sanitizeURLs = () => {
        const urls = enteredText
            .split("\n")
            .map(url => url.trim())
            .filter(url => url.length > 0);

        const sanitized: string[] = [];
        const invalid: string[] = [];

        urls.forEach(url => {
            try {
                // Remove protocol and any trailing slashes
                let cleaned = url.toLowerCase()
                    .replace(/^(https?:\/\/)?(www\.)?/, '')
                    .replace(/\/+$/, '');

                // Check if it's a valid domain pattern
                const domainPattern = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/;
                if (domainPattern.test(cleaned)) {
                    sanitized.push(`www.${cleaned}`);
                } else {
                    invalid.push(url);
                }
            } catch {
                invalid.push(url);
            }
        });

        setSanitizedURLs(sanitized.join('\n'));
        setInvalidEntries(invalid.join('\n'));
    };

    return (
        <div className="p-8">
            <div className="flex flex-col gap-6">
                {/* Header Section */}
                <div className="text-center space-y-4 mb-4">
                    <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl text-brand-dark bg-clip-text text-transparent bg-gradient-to-r from-brand to-brand-dark">
                        URL Sanitizer
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Convert URLs to a standardized format (www.domain.service)
                    </p>
                </div>

                {/* Info Alert */}
                <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                        Paste URLs in any format - we'll convert them to www.domain.service format
                    </AlertDescription>
                </Alert>

                {/* Main Content */}
                <div className="flex gap-8 items-stretch">
                    {/* Left Side */}
                    <div className="w-1/2 space-y-4">
                        <div className="space-y-2">
                            <label className="font-medium text-lg text-gray-700">
                                Enter URLs
                            </label>
                            <Textarea
                                placeholder="e.g. https://example.com&#10;http://www.domain.co.uk/&#10;subdomain.website.org"
                                value={enteredText}
                                onChange={(e) => setEnteredText(e.target.value)}
                                className="min-h-[250px] resize-none transition-all duration-200 focus:ring-2 focus:ring-brand/20"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={async () => {
                                    try {
                                        const text = await navigator.clipboard.readText();
                                        setEnteredText(text);
                                    } catch (err) {
                                        console.error("Failed to read clipboard contents: ", err);
                                    }
                                }}
                                className="flex items-center gap-2 hover:bg-gray-50"
                            >
                                <ClipboardCopy className="h-4 w-4" />
                                Paste
                            </Button>
                            <Button
                                variant="brand"
                                className={`flex-1 transition-all duration-200 ${enteredText.length === 0
                                        ? "cursor-not-allowed bg-slate-400 hover:bg-slate-400"
                                        : "hover:scale-[1.02] active:scale-[0.98]"
                                    }`}
                                onClick={sanitizeURLs}
                            >
                                <Eraser className="h-4 w-4 mr-2" />
                                Sanitize URLs
                            </Button>
                        </div>
                    </div>

                    <Separator orientation="vertical" className="bg-gray-200" />

                    {/* Right Side */}
                    <div className="w-1/2 space-y-6">
                        {/* Sanitized URLs */}
                        <div className="space-y-3">
                            <label className="font-medium text-lg text-gray-700 flex items-center gap-2">
                                Sanitized URLs
                                <span className="text-sm font-normal text-gray-500">
                                    (Standardized format)
                                </span>
                            </label>
                            <Textarea
                                readOnly
                                placeholder="Sanitized URLs will appear here..."
                                value={sanitizedURLs}
                                className="min-h-[120px] resize-none bg-green-50"
                            />
                            <Button
                                variant="outline"
                                onClick={() => navigator.clipboard.writeText(sanitizedURLs)}
                                disabled={!sanitizedURLs}
                                className="w-full flex items-center gap-2 disabled:opacity-50"
                            >
                                <ClipboardCopy className="h-4 w-4" />
                                Copy Sanitized URLs
                            </Button>
                        </div>

                        {/* Invalid Entries */}
                        <div className="space-y-3">
                            <label className="font-medium text-lg text-gray-700 flex items-center gap-2">
                                Invalid Entries
                                <span className="text-sm font-normal text-gray-500">
                                    (Could not be sanitized)
                                </span>
                            </label>
                            <Textarea
                                readOnly
                                placeholder="Invalid entries will appear here..."
                                value={invalidEntries}
                                className="min-h-[120px] resize-none bg-red-50"
                            />
                            <Button
                                variant="outline"
                                onClick={() => navigator.clipboard.writeText(invalidEntries)}
                                disabled={!invalidEntries}
                                className="w-full flex items-center gap-2 disabled:opacity-50"
                            >
                                <ClipboardCopy className="h-4 w-4" />
                                Copy Invalid Entries
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default URLSanitizer;
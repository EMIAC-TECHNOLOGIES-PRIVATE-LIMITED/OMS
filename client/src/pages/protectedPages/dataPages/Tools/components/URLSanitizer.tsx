import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ClipboardCopy, AlertCircle, Eraser, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

function URLSanitizer() {
    const [enteredText, setEnteredText] = useState<string>("");
    const [sanitizedURLs, setSanitizedURLs] = useState<string>("");
    const [invalidEntries, setInvalidEntries] = useState<string>("");
    const [copiedState, setCopiedState] = useState<string | null>(null);

    
    const sanitizeURLs = () => {
        const urls = enteredText
            .split(/[\n,;\r]+/)
            .flatMap(line => line.split(/\s+/))
            .map(url => url.trim())
            .filter(url => url.length > 0);
    
        const sanitized: string[] = [];
        const invalid: string[] = [];   
    
        urls.forEach(url => {
            try {
                // Skip obvious non-URLs
                if (!url || url === '-' || url.startsWith('#')) {
                    return;
                }
    
                // Handle special protocols
                if (/^(mailto|tel|ftp|sftp|file):/.test(url)) {
                    invalid.push(url);
                    return;
                }
    
                // Clean up common URL input issues
                let cleanUrl = url
                    .replace(/[\[\]<>(){}]/g, '') // Remove brackets
                    .replace(/^["']+|["']+$/g, '') // Remove quotes
                    .replace(/&amp;/g, '&')        // Fix HTML entities
                    .replace(/,$/, '');            // Remove trailing commas
                
                // Try to parse URL
                let parsedUrl: URL;
                try {
                    // If URL doesn't have protocol, add https:// for parsing
                    if (!cleanUrl.match(/^[a-zA-Z]+:\/\//)) {
                        parsedUrl = new URL(`https://${cleanUrl}`);
                    } else {
                        parsedUrl = new URL(cleanUrl);
                    }
                } catch (e) {
                    // Try to extract domain from malformed URL as fallback
                    const domainMatch = cleanUrl.match(/([a-z0-9][-a-z0-9]*\.)+[a-z]{2,}/i);
                    if (!domainMatch) {
                        invalid.push(url);
                        return;
                    }
                    try {
                        parsedUrl = new URL(`https://${domainMatch[0]}`);
                    } catch {
                        invalid.push(url);
                        return;
                    }
                }
    
                // Extract and normalize hostname
                let domain = parsedUrl.hostname.toLowerCase();
                
                // Handle IP addresses
                if (isIPAddress(domain)) {
                    sanitized.push(domain);
                    return;
                }
    
                // Remove www. prefix for consistent processing
                let cleanDomain = domain.replace(/^www\./, '');
                
                // Validate domain structure
                const domainPattern = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
                if (domainPattern.test(cleanDomain)) {
                    // Add www. prefix to main domains but not to subdomains
                    const parts = cleanDomain.split('.');
                    
                    if (parts.length === 2 || 
                        (parts.length >= 3 && ['co', 'com', 'org', 'net', 'edu', 'gov'].includes(parts[parts.length - 2]))) {
                        sanitized.push(`www.${cleanDomain}`);
                    } else {
                        sanitized.push(cleanDomain);
                    }
                } else {
                    invalid.push(url);
                }
            } catch (error) {
                invalid.push(url);
            }
        });
    
        // Helper function to detect IP addresses
        function isIPAddress(domain: string): boolean {
            // IPv4 check
            const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
            if (ipv4Pattern.test(domain)) {
                const parts = domain.split('.').map(part => parseInt(part, 10));
                return parts.every(part => part >= 0 && part <= 255);
            }
            
            // IPv6 check (comprehensive)
            const ipv6Pattern = /^(([0-9a-f]{1,4}:){7,7}[0-9a-f]{1,4}|([0-9a-f]{1,4}:){1,7}:|([0-9a-f]{1,4}:){1,6}:[0-9a-f]{1,4}|([0-9a-f]{1,4}:){1,5}(:[0-9a-f]{1,4}){1,2}|([0-9a-f]{1,4}:){1,4}(:[0-9a-f]{1,4}){1,3}|([0-9a-f]{1,4}:){1,3}(:[0-9a-f]{1,4}){1,4}|([0-9a-f]{1,4}:){1,2}(:[0-9a-f]{1,4}){1,5}|[0-9a-f]{1,4}:((:[0-9a-f]{1,4}){1,6})|:((:[0-9a-f]{1,4}){1,7}|:)|fe80:(:[0-9a-f]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-f]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/i;
            return ipv6Pattern.test(domain);
        }
    
        // Remove duplicates before setting state
        const uniqueSanitized = [...new Set(sanitized)];
        const uniqueInvalid = [...new Set(invalid)];
    
        setSanitizedURLs(uniqueSanitized.join('\n'));
        setInvalidEntries(uniqueInvalid.join('\n'));
    };

    // const sanitizeURLs = () => {
    //     const urls = enteredText
    //         .split("\n")
    //         .map(url => url.trim())
    //         .filter(url => url.length > 0);

    //     const sanitized: string[] = [];
    //     const invalid: string[] = [];   

    //     urls.forEach(url => {
    //         try {
    //             // Remove protocol and any trailing slashes
    //             let cleaned = url.toLowerCase()
    //                 .replace(/^(https?:\/\/)?(www\.)?/, '')
    //                 .replace(/\/+$/, '');

    //             // Check if it's a valid domain pattern
    //             const domainPattern = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/;
    //             if (domainPattern.test(cleaned)) {
    //                 sanitized.push(`www.${cleaned}`);
    //             } else {
    //                 invalid.push(url);
    //             }
    //         } catch {
    //             invalid.push(url);
    //         }
    //     });

    //     setSanitizedURLs(sanitized.join('\n'));
    //     setInvalidEntries(invalid.join('\n'));
    // };

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopiedState(type);
        setTimeout(() => setCopiedState(null), 2000); // Reset after 2 seconds
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
                                placeholder="e.g. https://example.com
http://www.domain.co.uk/
subdomain.website.org"
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
                                onClick={() => handleCopy(sanitizedURLs, "sanitized")}
                                disabled={!sanitizedURLs}
                                className="w-full flex items-center gap-2 disabled:opacity-50 relative overflow-hidden"
                            >
                                {copiedState === "sanitized" ? (
                                    <>
                                        <Check className="h-4 w-4 text-green-500 transition-all duration-300 ease-in-out" />
                                        <span className="transition-all duration-300">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <ClipboardCopy className="h-4 w-4 transition-all duration-300" />
                                        <span className="transition-all duration-300">Copy Sanitized URLs</span>
                                    </>
                                )}
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
                                onClick={() => handleCopy(invalidEntries, "invalid")}
                                disabled={!invalidEntries}
                                className="w-full flex items-center gap-2 disabled:opacity-50 relative overflow-hidden"
                            >
                                {copiedState === "invalid" ? (
                                    <>
                                        <Check className="h-4 w-4 text-green-500 transition-all duration-300 ease-in-out" />
                                        <span className="transition-all duration-300">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <ClipboardCopy className="h-4 w-4 transition-all duration-300" />
                                        <span className="transition-all duration-300">Copy Invalid Entries</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default URLSanitizer;
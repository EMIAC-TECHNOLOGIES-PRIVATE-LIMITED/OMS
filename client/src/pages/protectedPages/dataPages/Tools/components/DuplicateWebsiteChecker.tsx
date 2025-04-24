import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useState } from "react";
import { ClipboardCopy, AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { duplicateWebsiteChecker } from "@/utils/apiService/toolsAPI";
import { WebsiteCheckerResponse } from "../../../../../../../shared/src/types";

function DuplicateWebsiteChecker() {
    const [enteredText, setEnteredText] = useState<string>("");
    const [newDomains, setNewDomains] = useState<string>("");
    const [duplicateDomains, setDuplicateDomains] = useState<string>("");
    const [trashSites, setTrashSites] = useState<string>("");
    const [blacklistSites, setBlacklistSites] = useState<string>("");
    const [copiedState, setCopiedState] = useState<string | null>(null);

    const checkDomain = useCallback(async () => {
        const domainArray = enteredText
            .split("\n")
            .map((domain) => domain.trim())
            .filter((domain) => domain.length > 0);

        try {
            const response: WebsiteCheckerResponse = await duplicateWebsiteChecker(domainArray);
            if (response.success && response.data) {
                if (response.data.newDomains.length > 0) {
                    setNewDomains(response.data.newDomains.join("\n"));
                } else {
                    setNewDomains("");
                }
                if (response.data.duplicates.length > 0) {
                    setDuplicateDomains(response.data.duplicates.join("\n"));
                } else {
                    setDuplicateDomains("");
                }
                if (response.data.trashSites.length > 0) {
                    setTrashSites(response.data.trashSites.join("\n"));
                } else {
                    setTrashSites("");
                }
                if (response.data.blacklistSites.length > 0) {
                    setBlacklistSites(response.data.blacklistSites.join("\n"));
                } else {
                    setBlacklistSites("");
                }
            } else {
                console.error("API responded with an error:", response.message);
            }
        } catch (error) {
            console.error("Error checking domains:", error);
        }
    }, [enteredText]);

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
                        Duplicate Domains Lookup
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Check if your domains are already present in our database
                    </p>
                </div>

                {/* Info Alert */}
                <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                        Enter one domain per line or paste a list of domains
                    </AlertDescription>
                </Alert>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Side - Input Section */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="font-medium text-lg text-gray-700">
                                Enter Domains
                            </label>
                            <Textarea
                                placeholder="e.g. example.com
domain.com
website.com"
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
                                onClick={checkDomain}
                            >
                                Check Domains
                            </Button>
                        </div>
                    </div>

                    {/* Right Side - Results Section */}
                    <div className="space-y-6">
                        {/* New Domains */}
                        <div className="space-y-3">
                            <label className="font-medium text-lg text-gray-700 flex items-center gap-2">
                                New Domains
                                <span className="text-sm font-normal text-gray-500">
                                    (Not found in database)
                                </span>
                            </label>
                            <Textarea
                                readOnly
                                placeholder="Results for new domains will appear here..."
                                value={newDomains}
                                className="min-h-[120px] resize-none bg-green-100"
                            />
                            <Button
                                variant="outline"
                                onClick={() => handleCopy(newDomains, "new")}
                                disabled={!newDomains.length}
                                className="w-full flex items-center gap-2 disabled:opacity-50 relative overflow-hidden"
                            >
                                {copiedState === "new" ? (
                                    <>
                                        <Check className="h-4 w-4 text-green-500 transition-all duration-300 ease-in-out" />
                                        <span className="transition-all duration-300">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <ClipboardCopy className="h-4 w-4 transition-all duration-300" />
                                        <span className="transition-all duration-300">Copy New Domains</span>
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Duplicate Domains */}
                        <div className="space-y-3">
                            <label className="font-medium text-lg text-gray-700 flex items-center gap-2">
                                Duplicate Domains
                                <span className="text-sm font-normal text-gray-500">
                                    (Already in database)
                                </span>
                            </label>
                            <Textarea
                                readOnly
                                placeholder="Results for duplicate domains will appear here..."
                                value={duplicateDomains}
                                className="min-h-[120px] resize-none bg-red-100"
                            />
                            <Button
                                variant="outline"
                                onClick={() => handleCopy(duplicateDomains, "duplicate")}
                                disabled={!duplicateDomains.length}
                                className="w-full flex items-center gap-2 disabled:opacity-50 relative overflow-hidden"
                            >
                                {copiedState === "duplicate" ? (
                                    <>
                                        <Check className="h-4 w-4 text-green-500 transition-all duration-300 ease-in-out" />
                                        <span className="transition-all duration-300">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <ClipboardCopy className="h-4 w-4 transition-all duration-300" />
                                        <span className="transition-all duration-300">Copy Duplicate Domains</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* New Categories Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Trash Sites */}
                    <div className="space-y-3">
                        <label className="font-medium text-lg text-gray-700 flex items-center gap-2">
                        Non-Responsive Sites
                            <span className="text-sm font-normal text-gray-500">
                                (Already pitched domains)
                            </span>
                        </label>
                        <Textarea
                            readOnly
                            placeholder="Non-Responsive sites will appear here..."
                            value={trashSites}
                            className="min-h-[120px] resize-none bg-yellow-100"
                        />
                        <Button
                            variant="outline"
                            onClick={() => handleCopy(trashSites, "trash")}
                            disabled={!trashSites.length}
                            className="w-full flex items-center gap-2 disabled:opacity-50 relative overflow-hidden"
                        >
                            {copiedState === "trash" ? (
                                <>
                                    <Check className="h-4 w-4 text-green-500 transition-all duration-300 ease-in-out" />
                                    <span className="transition-all duration-300">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <ClipboardCopy className="h-4 w-4 transition-all duration-300" />
                                    <span className="transition-all duration-300">Copy Non-Responsive Sites</span>
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Blacklist Sites */}
                    <div className="space-y-3">
                        <label className="font-medium text-lg text-gray-700 flex items-center gap-2">
                            Blacklist Sites
                            <span className="text-sm font-normal text-gray-500">
                                (Blacklisted domains in database)
                            </span>
                        </label>
                        <Textarea
                            readOnly
                            placeholder="Blacklisted sites will appear here..."
                            value={blacklistSites}
                            className="min-h-[120px] resize-none bg-slate-200"
                        />
                        <Button
                            variant="outline"
                            onClick={() => handleCopy(blacklistSites, "blacklist")}
                            disabled={!blacklistSites.length}
                            className="w-full flex items-center gap-2 disabled:opacity-50 relative overflow-hidden"
                        >
                            {copiedState === "blacklist" ? (
                                <>
                                    <Check className="h-4 w-4 text-green-500 transition-all duration-300 ease-in-out" />
                                    <span className="transition-all duration-300">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <ClipboardCopy className="h-4 w-4 transition-all duration-300" />
                                    <span className="transition-all duration-300">Copy Blacklist Sites</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DuplicateWebsiteChecker;
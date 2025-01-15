import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useState } from "react";
import { ClipboardCopy, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { duplicateWebsiteChecker } from "@/utils/apiService/toolsAPI";
import { WebsiteCheckerResponse } from "../../../../../../../shared/src/types";

function DuplicateWebsiteChecker() {
    const [enteredText, setEnteredText] = useState<string>("");
    const [newDomains, setNewDomains] = useState<string>("");
    const [duplicateDomains, setDuplicateDomains] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const checkDomain = useCallback(async () => {
        setLoading(true);
        const domainArray = enteredText
            .split("\n")
            .map((domain) => domain.trim())
            .filter((domain) => domain.length > 0);

        try {
            const response: WebsiteCheckerResponse = await duplicateWebsiteChecker(domainArray);
            if (response.success && response.data) {
                if (response.data.newDomains.length > 0) {
                    setNewDomains(response.data.newDomains.join("\n"));
                }
                if (response.data.duplicates.length > 0) {
                    setDuplicateDomains(response.data.duplicates.join("\n"));
                }
            } else {
                // Handle unsuccessful responses if needed
                console.error("API responded with an error:", response.message);
            }
        } catch (error) {
            console.error("Error checking domains:", error);
        } finally {
            setLoading(false);
        }
    }, [enteredText]);

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
                <div className="flex gap-8 items-stretch">
                    {/* Left Side */}
                    <div className="w-1/2 space-y-4">
                        <div className="space-y-2">
                            <label className="font-medium text-lg text-gray-700">
                                Enter Domains
                            </label>
                            <Textarea
                                placeholder="e.g. example.com&#10;domain.com&#10;website.com"
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
                                {(loading) ? "Loading .." : " Check Domains"}
                            </Button>
                        </div>
                    </div>

                    <Separator orientation="vertical" className="bg-gray-200" />

                    {/* Right Side */}
                    <div className="w-1/2 space-y-6">
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
                                className={`min-h-[120px] resize-none ${duplicateDomains.length > 0 ? 'bg-green-100' : 'bg-gray-50'}`}
                            />
                            <Button
                                variant="outline"
                                onClick={() => navigator.clipboard.writeText(newDomains)}
                                disabled={!newDomains.length}
                                className="w-full flex items-center gap-2 disabled:opacity-50"
                            >
                                <ClipboardCopy className="h-4 w-4" />
                                Copy New Domains
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
                                className={`min-h-[120px] resize-none ${duplicateDomains.length > 0 ? 'bg-red-100' : 'bg-gray-50'}`}
                            />

                            <Button
                                variant="outline"
                                onClick={() => navigator.clipboard.writeText(duplicateDomains)}
                                disabled={!duplicateDomains.length}
                                className="w-full flex items-center gap-2 disabled:opacity-50"

                            >
                                <ClipboardCopy className="h-4 w-4" />
                                Copy Duplicate Domains
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default DuplicateWebsiteChecker;

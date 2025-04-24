import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ClipboardCopy } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { addTrashDomains } from "@/utils/apiService/toolsAPI"; // Adjust path as needed

function TrashDomains() {
  const [domainsText, setDomainsText] = useState<string>("");
  const [pitchedFrom, setPitchedFrom] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>("Add Non-Responsive Domains");

  const handleAddTrashDomains = async () => {
    setLoading(true);
    const domainArray = domainsText
      .split("\n")
      .map((domain) => domain.trim())
      .filter((domain) => domain.length > 0);

    try {
      const response = await addTrashDomains(domainArray, pitchedFrom || undefined);
      if (response.success) {
        setButtonText("Domains Added Successfully!");
        setDomainsText(""); // Clear the textarea
        setPitchedFrom(""); // Clear the input
        setTimeout(() => setButtonText("Add Trash Domains"), 2000); // Reset button text after 2s
      } else {
        console.error("API responded with an error:", response.message);
        setButtonText("Failed to Add Domains");
        setTimeout(() => setButtonText("Add Trash Domains"), 2000);
      }
    } catch (error) {
      console.error("Error adding trash domains:", error);
      setButtonText("Error Occurred");
      setTimeout(() => setButtonText("Add Trash Domains"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = domainsText.trim().length === 0;

  return (
    <div className="p-8">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-4">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl text-brand-dark bg-clip-text text-transparent bg-gradient-to-r from-brand to-brand-dark">
          Non-Responsive Domains Manager
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Add domains to mark as Non-Responsive in the database
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-700">
            Enter one domain per line and optionally specify where they were pitched from
          </AlertDescription>
        </Alert>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-medium text-lg text-gray-700">Enter Domains</label>
            <Textarea
              placeholder="e.g. trash.com\nspam.net\njunk.org"
              value={domainsText}
              onChange={(e) => setDomainsText(e.target.value)}
              className="min-h-[200px] resize-none transition-all duration-200 focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-lg text-gray-700">
              Pitched From (Optional)
            </label>
            <Input
              placeholder="e.g. email campaign"
              value={pitchedFrom}
              onChange={(e) => setPitchedFrom(e.target.value)}
              className="transition-all duration-200 focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setDomainsText(text);
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
              className={`flex-1 transition-all duration-200 ${
                isButtonDisabled
                  ? "cursor-not-allowed bg-slate-400 hover:bg-slate-400"
                  : "hover:scale-[1.02] active:scale-[0.98]"
              }`}
              onClick={handleAddTrashDomains}
              disabled={isButtonDisabled || loading}
            >
              {loading ? "Adding..." : buttonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrashDomains;
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCallback, useEffect, useRef, useState } from "react";
import { ClipboardCopy, AlertCircle, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getLiveMatrics } from "@/utils/apiService/toolsAPI";
import { DomainEntry } from "../../../../../../../shared/src/types";
import { toast } from "@/hooks/use-toast";


function LiveMatrics() {
  const [enteredText, setEnteredText] = useState<string>("");
  const [domainsFound, setDomainsFound] = useState<DomainEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showResults && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showResults]);


  const checkPrices = useCallback(async () => {
    setLoading(true);
    const domainArray = enteredText
      .split("\n")
      .map((domain) => domain.trim())
      .filter((domain) => domain.length > 0);

     if (domainArray.length > 10) {
       setLoading(false);
       toast({
         title: "Error",
         description: "You can only check 10 domains at a time.",
         variant: "destructive",
       });
       return;
     }

    try {
      const response = await getLiveMatrics(domainArray);
      if (response.success && response.data) {
        setDomainsFound(response.data);
        setShowResults(true);
      } else {
        console.error("API responded with an error:", response.message);
      }
    } catch (error) {
      console.error("Error checking prices:", error);
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
            Live Domain Matrics
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get latest domain matrics like DA, PA, and Semrush Traffic for a list of domains.
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            Enter one domain per line or paste a list of domains
          </AlertDescription>
        </Alert>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-medium text-lg text-gray-700">
              Enter Domains [MAX LIMIT : 10]
            </label>
            <Textarea
              placeholder="e.g. example.com&#10;domain.com&#10;website.com"
              value={enteredText}
              onChange={(e) => setEnteredText(e.target.value)}
              className="min-h-[200px] resize-none transition-all duration-200 focus:ring-2 focus:ring-brand/20"
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
              onClick={checkPrices}
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Searching..." : "Look up Metrics"}
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="space-y-6 mt-8"
            ref={resultsRef}>
            {/* Domains Found Table */}
            {domainsFound.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Domain Metrics
                </h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>DA</TableHead>
                      <TableHead>PA</TableHead>
                      <TableHead>Spam Score</TableHead>
                      <TableHead>Semrush Traffic</TableHead>
                      <TableHead>Organic Semrush</TableHead>
                      <TableHead>Domain Ranking</TableHead>
                      
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domainsFound.map((entry, index) => {
                      const domain = Object.keys(entry)[0];
                      const metrics = entry[domain];
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{domain}</TableCell>
                          <TableCell>{metrics.da}</TableCell>
                          <TableCell>{metrics.pa}</TableCell>
                          <TableCell>{metrics.ss}</TableCell>
                          <TableCell>{metrics.semrushTraffic.toLocaleString()}</TableCell>
                          <TableCell>{metrics.organic_semrush}</TableCell>
                          <TableCell>{metrics.domain_ranking}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default LiveMatrics

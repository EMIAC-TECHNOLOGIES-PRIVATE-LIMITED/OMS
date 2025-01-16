import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCallback, useEffect, useRef, useState } from "react";
import { ClipboardCopy, AlertCircle, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { priceChecker } from "@/utils/apiService/toolsAPI";
import type { PriceCheckerResponse } from "../../../../../../../shared/src/types";

interface DomainPriceInfo {
  website: string;
  vendor: {
    id?: number;
    name?: string;
    phone?: string;
    email?: string;
    country?: string | null;
  };
  price: number;
  sailingPrice: number | null;
  discount: number | null;
}

function PriceLookupTool() {
  const [enteredText, setEnteredText] = useState<string>("");
  const [domainsFound, setDomainsFound] = useState<DomainPriceInfo[]>([]);
  const [domainsNotFound, setDomainsNotFound] = useState<string[]>([]);
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

    try {
      const response: PriceCheckerResponse = await priceChecker(domainArray);
      if (response.success && response.data) {
        setDomainsFound(response.data.domainsFound);
        setDomainsNotFound(response.data.domainsNotFound);
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
            Domain Price Lookup
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Check pricing information for domains across different vendors
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
              Enter Domains
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
              {loading ? "Searching..." : "Look up Prices"}
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
                  Price Information
                </h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Sailing Price</TableHead>
                      <TableHead>Discount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domainsFound.map((domain) => (
                      <TableRow key={domain.website}>
                        <TableCell className="font-medium">
                          {domain.website}
                        </TableCell>
                        <TableCell>{domain.vendor.name || 'N/A'}</TableCell>
                        <TableCell>${domain.price.toFixed(2)}</TableCell>
                        <TableCell>
                          {domain.sailingPrice
                            ? `$${domain.sailingPrice.toFixed(2)}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {domain.discount
                            ? `${domain.discount}%`
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Domains Not Found Section */}
            {domainsNotFound.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Domains Not Found
                </h2>
                <Textarea
                  readOnly
                  value={domainsNotFound.join('\n')}
                  className="min-h-[100px] resize-none bg-red-100"
                />
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(domainsNotFound.join('\n'))}
                  className="w-full flex items-center gap-2"
                >
                  <ClipboardCopy className="h-4 w-4" />
                  Copy Not Found Domains
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PriceLookupTool;
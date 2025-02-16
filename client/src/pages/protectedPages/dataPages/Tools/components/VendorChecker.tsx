import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCallback, useEffect, useRef, useState } from "react";
import { ClipboardCopy, AlertCircle, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { vendorChecker } from "@/utils/apiService/toolsAPI";
import type { VendorCheckerResponse } from "../../../../../../../shared/src/types";

interface VendorInfo {
  vendorId: number;
  vendorName: string;
  vendorPhone: string;
  vendorEmail: string;
  vendorCountry: string | null;
}

interface DomainVendors {
  [domain: string]: VendorInfo[];
}

function VendorLookupTool() {
  const [enteredText, setEnteredText] = useState<string>("");
  const [domainVendors, setDomainVendors] = useState<DomainVendors>({});
  const [domainsNotFound, setDomainsNotFound] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const resultRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (showResults && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showResults]);

  const checkVendors = useCallback(async () => {
    setLoading(true);
    const domainArray = enteredText
      .split("\n")
      .map((domain) => domain.trim())
      .filter((domain) => domain.length > 0);

    try {
      const response: VendorCheckerResponse = await vendorChecker(domainArray);
      if (response.success && response.data) {
        const mappedVendors = Object.fromEntries(
          Object.entries(response.data.domainsFound.vendors).map(([domain, vendors]) => [
            domain,
            vendors.map(vendor => ({ ...vendor, vendorCountry: null }))
          ])
        );
        setDomainVendors(mappedVendors);
        setDomainsNotFound(response.data.domainsNotFound);
        setShowResults(true);
      } else {
        console.error("API responded with an error:", response.message);
      }
    } catch (error) {
      console.error("Error checking vendors:", error);
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
            Domain Vendor Lookup
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find vendor information for your domains
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
              onClick={checkVendors}
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Searching..." : "Look up Vendors"}
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="space-y-8 mt-8"
            ref={resultRef}>
            {/* Domains Found Section */}
            {Object.keys(domainVendors).length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Vendor Information
                </h2>
                {Object.entries(domainVendors).map(([domain, vendors]) => (
                  <div key={domain} className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-700">
                      {domain}
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vendor Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Country</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vendors.map((vendor) => (
                          <TableRow key={vendor.vendorId}>
                            <TableCell className="font-medium">
                              {vendor.vendorName}
                            </TableCell>
                            <TableCell>{vendor.vendorEmail}</TableCell>
                            <TableCell>{vendor.vendorPhone}</TableCell>
                            <TableCell>
                              {vendor.vendorCountry || 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
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

export default VendorLookupTool;
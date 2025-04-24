import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCallback, useEffect, useRef, useState } from "react";
import { ClipboardCopy, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { categoryLinkFetcher } from "@/utils/apiService/toolsAPI";
import type { categoryLinksResponse } from "../../../../../../../shared/src/types";
import * as XLSX from "xlsx";

interface CategoryLinkData {
  website: string;
  category: string;
  categoryLink: string;
}

function CategoryLinks() {
  const [enteredText, setEnteredText] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [categoryLinks, setCategoryLinks] = useState<CategoryLinkData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showResults && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showResults]);

  const fetchCategoryLinks = useCallback(async () => {
    setLoading(true);
    const domainArray = enteredText
      .split("\n")
      .map((domain) => domain.trim())
      .filter((domain) => domain.length > 0);

    try {
      const response: categoryLinksResponse = await categoryLinkFetcher(domainArray, category);
      if (response.success && response.data?.data) {
        setCategoryLinks(response.data.data);
        setShowResults(true);
      } else {
        console.error("API responded with an error:", response.message);
      }
    } catch (error) {
      console.error("Error fetching category links:", error);
    } finally {
      setLoading(false);
    }
  }, [enteredText, category]);

  const exportToExcel = () => {
    const worksheetData = categoryLinks.map((item) => ({
      Website: item.website,
      Category: item.category,
      "Category Link": item.categoryLink,
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Category Links");
    const date = new Date().toISOString().split("T")[0];
    const filename = `category-links-${date}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const isButtonDisabled = enteredText.trim().length === 0 || category.trim().length === 0;

  return (
    <div className="p-8">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-4">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl text-brand-dark bg-clip-text text-transparent bg-gradient-to-r from-brand to-brand-dark">
            Category Links Finder
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover category-specific links for your domains
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-700">
            Enter one domain per line and a category keyword to find related links
          </AlertDescription>
        </Alert>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-medium text-lg text-gray-700">
              Enter Domains
            </label>
            <Textarea
              placeholder="e.g. example.com\ndomain.com\nwebsite.com"
              value={enteredText}
              onChange={(e) => setEnteredText(e.target.value)}
              className="min-h-[200px] resize-none transition-all duration-200 focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-lg text-gray-700">
              Category Keyword
            </label>
            <Input
              placeholder="e.g. technology"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="transition-all duration-200 focus:ring-2 focus:ring-brand/20"
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
              className={`flex-1 transition-all duration-200 ${isButtonDisabled
                ? "cursor-not-allowed bg-slate-400 hover:bg-slate-400"
                : "hover:scale-[1.02] active:scale-[0.98]"
              }`}
              onClick={fetchCategoryLinks}
              disabled={isButtonDisabled}
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Searching..." : "Find Category Links"}
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="space-y-8 mt-8" ref={resultRef}>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Category Links
                </h2>
                <Button
                  variant="outline"
                  onClick={exportToExcel}
                  className="flex items-center gap-2 hover:bg-gray-50"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Export to Excel
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Website</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Category Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryLinks.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <a
                          href={`https://${item.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {item.website}
                        </a>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        {item.categoryLink === "Not Found" ? (
                          <span>{item.categoryLink}</span>
                        ) : (
                          <a
                            href={item.categoryLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {item.categoryLink}
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryLinks;
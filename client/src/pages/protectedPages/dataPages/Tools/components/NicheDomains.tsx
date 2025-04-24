import { useState, useEffect } from "react";
import { nicheDomains } from "@/utils/apiService/toolsAPI";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define the type for the API response
export interface NicheDomainsResponse {
  status: number;
  message: string;
  success: boolean;
  data: {
    niches: Array<{
      niche: string | null;
      count: number;
    }>;
  }
}

function NicheDomains() {
  const [nicheData, setNicheData] = useState<NicheDomainsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Color palette for tiles
  const colors = [
    "bg-blue-100 border-blue-300 text-blue-800",
    "bg-green-100 border-green-300 text-green-800",
    "bg-purple-100 border-purple-300 text-purple-800",
    "bg-amber-100 border-amber-300 text-amber-800",
    "bg-rose-100 border-rose-300 text-rose-800",
    "bg-teal-100 border-teal-300 text-teal-800",
    "bg-indigo-100 border-indigo-300 text-indigo-800",
    "bg-cyan-100 border-cyan-300 text-cyan-800",
    "bg-emerald-100 border-emerald-300 text-emerald-800",
    "bg-orange-100 border-orange-300 text-orange-800",
  ];

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await nicheDomains();
        setNicheData(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching niche domains:", error);
        setError("Failed to load niche domain data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter niches based on search term, handling null values
  const filteredNiches = nicheData?.data?.niches.filter(item =>
    item.niche ? item.niche.toLowerCase().includes(searchTerm.toLowerCase()) : false
  ) || [];

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Niche Domains</h2>
      
      {/* Search Input */}
      <div className="mb-8">
        <Input
          placeholder="Search for niches..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full max-w-md"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* No Results State */}
      {!isLoading && !error && filteredNiches.length === 0 && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No results found</AlertTitle>
          <AlertDescription>
            No niches match your search term. Try a different keyword.
          </AlertDescription>
        </Alert>
      )}

      {/* Niche Tiles */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredNiches.map((niche, index) => (
            <Card 
              key={niche.niche ?? `niche-${index}`} 
              className={`${colors[index % colors.length]} border-2 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <h3 className="text-xl font-semibold">{niche.niche ?? "Unknown"}</h3>
                  <div className="text-4xl font-bold">{niche.count}</div>
                  <div className="text-sm opacity-80">domains</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default NicheDomains;
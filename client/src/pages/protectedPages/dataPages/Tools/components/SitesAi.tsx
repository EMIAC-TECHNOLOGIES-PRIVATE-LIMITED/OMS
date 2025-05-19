import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Loader2, Bot, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { getSitesAi } from '@/utils/apiService/toolsAPI'

// Type for the AI response message
interface AiResponse {
  message: string
  isError: boolean
}

// Type for the site data
interface SiteData {
  website: string
  niche: string
  contentCategories: string
  siteClassification: string
  domainAuthority: number
  pageAuthority: number
  linkAttribute: string
  ahrefTraffic: number
  spamScore: number
  domainRating: number
  semrushTraffic: number;
  semrushOrganicTraffic: number;
  numberOfLinks: number;
}

// Type for the query results
interface QueryResult {
  sites: SiteData[]
  totalCount: number
  page: number
  pageSize: number
  query: any
  order: any
}

function SitesAi() {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [queryResults, setQueryResults] = useState<QueryResult | null>(null)
  const [aiResponse, setAiResponse] = useState<AiResponse | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [savedQuery, setSavedQuery] = useState<any>(null)
  const [savedOrder, setSavedOrder] = useState<any>(null)
  const [currentQuery, setCurrentQuery] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const fetchSitesData = async (userMsg: string, query?: any, order?: any, page: number = 1, size: number = 10) => {
    setIsLoading(true)
    setAiResponse(null)

    try {
      // If user message has changed, don't send query and order
      const params = userMsg !== currentQuery ?
        { userMessage: userMsg } :
        { userMessage: userMsg, query, order, page, pageSize: size }

      const response = await getSitesAi(
        params.userMessage,
        params.query,
        params.order,
        params.page,
        params.pageSize
      )

      if (!response.success) {
        throw new Error(response.message || 'Failed to process your query')
      }

      // Set AI response message
      setAiResponse({
        message: response.message,
        isError: false
      })

      // Set query results if available
      if (response.data && typeof response.data !== 'string') {
        setQueryResults(response.data)
        setSavedQuery(response.data.query)
        setSavedOrder(response.data.order)
        setCurrentPage(response.data.page)
        setPageSize(response.data.pageSize)
      }

      // Save the current query for comparison
      setCurrentQuery(userMsg)
    } catch (err: any) {
      console.error('Error processing AI query:', err)

      // Set error message
      setAiResponse({
        message: 'Sorry, I encountered an error processing your request. Please try again or refine your query. Please limit your queries to the following properties: website, niche, contentCategories, siteClassification, domainAuthority, pageAuthority, linkAttribute, ahrefTraffic, spamScore, domainRating.',
        isError: true
      })

      // Clear results on error
      setQueryResults(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim()) return

    // Check if user message has changed
    const isNewQuery = inputValue !== currentQuery

    // If it's a new query, reset pagination and saved query/order
    if (isNewQuery) {
      setCurrentPage(1)
      setSavedQuery(null)
      setSavedOrder(null)
    }

    // Fetch data with the user message
    await fetchSitesData(inputValue, isNewQuery ? undefined : savedQuery, isNewQuery ? undefined : savedOrder, isNewQuery ? 1 : currentPage, pageSize)
  }

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || (queryResults && newPage > Math.ceil(queryResults.totalCount / pageSize))) {
      return
    }

    setCurrentPage(newPage)
    await fetchSitesData(currentQuery, savedQuery, savedOrder, newPage, pageSize)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] w-full max-w-[95vw] mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">AI Query Assistant</h2>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Describe what domains you're looking for..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="brand"
          size="icon"
          disabled={isLoading || !inputValue.trim() || inputValue === currentQuery}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </form>

      {/* AI Response message */}
      {aiResponse && (
        <Card className={cn("mb-6", aiResponse.isError ? "border-red-300" : "border-primary/30")}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center",
                aiResponse.isError ? "bg-red-100" : "bg-primary/20")}>
                <Bot size={18} className={aiResponse.isError ? "text-red-500" : "text-primary"} />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm whitespace-pre-wrap">{aiResponse.message}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <Card className="mb-6">
          <CardContent className="p-4 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-brand" />
            <span>Processing your query...</span>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!aiResponse && !isLoading && !queryResults && (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 mb-6">
          <Bot size={48} className="mb-2 text-brand" />
          <h3 className="text-xl font-medium mb-2">AI Query Assistant</h3>
          <p className="max-w-md">
            Describe what domains you're looking for in natural language, and I'll help you find it.
            For example, try "Show me all sites with domain authority greater than 50" or
            "Find websites in the health niche with traffic over 10,000".
          </p>
          <p className="max-w-md mt-2 text-sm">
            You can query based on these properties: Domain Address, Niche, Content Categories, Site Classification, Domain Authority(da), Page Authority(pa), Link Attribute, aHREF Traffic, Spam Score, Domain Rating(dr), SemRush Traffic, Organic Traffic, Number of Links.
          </p>
        </div>
      )}

      {/* Query results table */}
      {queryResults && queryResults.sites && queryResults.sites.length > 0 && (
        <Card className="mb-6 w-full">
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Query Results</h3>

              {/* Pagination controls - moved to top right */}
              {queryResults.totalCount > pageSize && (
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500 hidden sm:block">
                    Showing {(queryResults.page - 1) * queryResults.pageSize + 1} to {Math.min(queryResults.page * queryResults.pageSize, queryResults.totalCount)} of {queryResults.totalCount} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm whitespace-nowrap">
                      {currentPage} / {Math.ceil(queryResults.totalCount / pageSize)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= Math.ceil(queryResults.totalCount / pageSize) || isLoading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[12%] truncate">Website</TableHead>
                    <TableHead className="w-[8%] truncate">Niche</TableHead>
                    <TableHead className="w-[10%] truncate">Content Categories</TableHead>
                    <TableHead className="w-[10%] truncate">Site Classification</TableHead>
                    <TableHead className="w-[6%] text-center">Domain Authority</TableHead>
                    <TableHead className="w-[6%] text-center">Page Authority</TableHead>
                    <TableHead className="w-[8%] truncate">Link Attribute</TableHead>
                    <TableHead className="w-[7%] text-center">Ahref Traffic</TableHead>
                    <TableHead className="w-[6%] text-center">Spam Score</TableHead>
                    <TableHead className="w-[7%] text-center">Domain Rating</TableHead>
                    <TableHead className="w-[7%] text-center">SemRush Traffic</TableHead>
                    <TableHead className="w-[7%] text-center">SemRush Organic</TableHead>
                    <TableHead className="w-[6%] text-center">Links</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queryResults.sites.map((site, index) => (
                    <TableRow key={index}>
                      <TableCell className="w-[12%] truncate" title={site.website}>
                        {site.website || '-'}
                      </TableCell>
                      <TableCell className="w-[8%] truncate" title={site.niche}>
                        {site.niche || '-'}
                      </TableCell>
                      <TableCell className="w-[10%] truncate" title={site.contentCategories}>
                        {site.contentCategories || '-'}
                      </TableCell>
                      <TableCell className="w-[10%] truncate" title={site.siteClassification}>
                        {site.siteClassification || '-'}
                      </TableCell>
                      <TableCell className="w-[6%] text-center">
                        {site.domainAuthority?.toString() || '-'}
                      </TableCell>
                      <TableCell className="w-[6%] text-center">
                        {site.pageAuthority?.toString() || '-'}
                      </TableCell>
                      <TableCell className="w-[8%] truncate" title={site.linkAttribute}>
                        {site.linkAttribute || '-'}
                      </TableCell>
                      <TableCell className="w-[7%] text-center">
                        {site.ahrefTraffic?.toString() || '-'}
                      </TableCell>
                      <TableCell className="w-[6%] text-center">
                        {site.spamScore?.toString() || '-'}
                      </TableCell>
                      <TableCell className="w-[7%] text-center">
                        {site.domainRating?.toString() || '-'}
                      </TableCell>
                      <TableCell className="w-[7%] text-center">
                        {site.semrushTraffic?.toString() || '-'}
                      </TableCell>
                      <TableCell className="w-[7%] text-center">
                        {site.semrushOrganicTraffic?.toString() || '-'}
                      </TableCell>
                      <TableCell className="w-[6%] text-center">
                        {site.numberOfLinks?.toString() || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}


    </div>
  )
}

export default SitesAi
import { addDispatchedDomainsRequest, categoryLinksResponse, getDispatchedDomainsResponse, PriceCheckerResponse, VendorCheckerResponse, WebsiteCheckerResponse } from "@shared/types";
import { Response } from "express";
import STATUS_CODES from "../constants/statusCodes";
import { AuthRequest } from "../types/sitesDataTypes";
import { APIError, APIResponse } from "../utils/apiHandler";
import { prismaClient } from "../utils/prismaClient";
import { getPermissionCached } from "../utils/getPermissions";
import { transformDates } from "../utils/dateTransformer";
import { httpClient } from "../utils/httpClient";

interface CategoryLinkItem {
    website: string;
    category: string;
    categoryLink: string;
}




export const toolsController = {
    websiteChecker: async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            if (!req.body) {
                return res.status(STATUS_CODES.BAD_REQUEST).json(
                    new APIError(STATUS_CODES.BAD_REQUEST, "Request body is required", [], false)
                );
            }

            const data = req.body;
            if (!data.domains || !Array.isArray(data.domains)) {
                return res.status(STATUS_CODES.BAD_REQUEST).json(
                    new APIError(STATUS_CODES.BAD_REQUEST, "Domains are required in the request body and must be an array", [], false)
                );
            }

            // Validate all domains are strings
            const validDomains = data.domains.filter((domain: any): domain is string => typeof domain === 'string');
            if (validDomains.length !== data.domains.length) {
                return res.status(STATUS_CODES.BAD_REQUEST).json(
                    new APIError(STATUS_CODES.BAD_REQUEST, "All domains must be strings", [], false)
                );
            }

            // Prepare result arrays
            const duplicates: string[] = [];
            const newDomains: string[] = [];
            const trashSites: string[] = [];
            const blacklistSites: string[] = [];

            try {
                // Batch query all sites at once instead of one by one
                const allSites = await prismaClient.site.findMany({
                    where: {
                        website: {
                            in: validDomains.map((domain: string) => domain.toLowerCase())
                        }
                    }
                });

                // Create a map for quick lookups
                const siteMap = new Map();
                allSites.forEach(site => {
                    siteMap.set(site.website.toLowerCase(), site);
                });

                // Batch query all trash sites at once
                const allTrashSites = await prismaClient.trashSites.findMany({
                    where: {
                        website: {
                            in: validDomains.map((domain: string) => domain.toLowerCase())
                        }
                    },
                    select: {
                        website: true,
                        pitchedFrom: true
                    }
                });

                // Create a map for quick lookups
                const trashSiteMap = new Map();
                allTrashSites.forEach(site => {
                    trashSiteMap.set(site.website.toLowerCase(), site);
                });

                // Process each domain using the maps (no more DB queries needed)
                for (const domain of validDomains) {
                    const lowerDomain = domain.toLowerCase();

                    // Check in regular sites
                    const foundSite = siteMap.get(lowerDomain) ||
                        allSites.find(site => site.website.toLowerCase().includes(lowerDomain));

                    if (foundSite) {
                        if (foundSite.websiteStatus === 'Blacklist') {
                            blacklistSites.push(domain);
                        } else {
                            duplicates.push(domain);
                        }
                        continue;
                    }

                    // Check in trash sites
                    const foundTrashSite = trashSiteMap.get(lowerDomain) ||
                        allTrashSites.find(site => site.website.toLowerCase().includes(lowerDomain));

                    if (foundTrashSite) {
                        trashSites.push(`${domain} (Pitched from: ${foundTrashSite.pitchedFrom})`);
                    } else {
                        newDomains.push(domain);
                    }
                }
            } catch (dbError) {
                console.error("Database operation failed:", dbError);
                throw new Error('Failed to process domains');
            }

            const response: WebsiteCheckerResponse["data"] = {
                duplicates,
                newDomains,
                trashSites,
                blacklistSites
            };

            return res.status(STATUS_CODES.OK).json(
                new APIResponse(STATUS_CODES.OK, "Website check completed", response, true)
            );
        } catch (error: any) {
            console.error("Error in websiteChecker:", error);
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
                new APIError(
                    STATUS_CODES.INTERNAL_SERVER_ERROR,
                    "An error occurred while processing your request",
                    [],
                    false
                )
            );
        }
    },

    priceChecker: async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            // Input validation
            if (!req.body) {
                return res.status(STATUS_CODES.BAD_REQUEST).json(
                    new APIError(STATUS_CODES.BAD_REQUEST, "Request body is required", [], false)
                );
            }

            const data = req.body;
            if (!data.domains || !Array.isArray(data.domains) || data.domains.length === 0) {
                return res.status(STATUS_CODES.BAD_REQUEST).json(
                    new APIError(STATUS_CODES.BAD_REQUEST, "Domains are required in the request body and must be a non-empty array", [], false)
                );
            }

            // Validate all domains first
            for (const domain of data.domains) {
                if (typeof domain !== 'string') {
                    return res.status(STATUS_CODES.BAD_REQUEST).json(
                        new APIError(STATUS_CODES.BAD_REQUEST, `Invalid domain format for: ${domain}`, [], false)
                    );
                }
            }

            const domainsFound: Array<{
                website: string;
                vendor: {
                    id?: number;
                    name?: string;
                    phone?: string;
                    email?: string;
                    country?: string | null;
                };
                price: number;
                sellingPrice: number | null;
                discount: number | null;
            }> = [];
            const domainsNotFound: string[] = [];

            try {
                // Fetch all sites for all domains in a single query
                const allSites = await prismaClient.site.findMany({
                    where: {
                        OR: data.domains.map((domain: string) => ({
                            website: {
                                contains: domain,
                                mode: 'insensitive',
                            }
                        }))
                    },
                    include: {
                        vendor: true,
                    },
                });

                // Create a map to track which domains were found
                const foundDomainsMap = new Map<string, boolean>();

                // Process all sites
                allSites.forEach(site => {
                    // Find which domain this site matches with
                    const matchingDomain = data.domains.find((domain: string) =>
                        site.website.toLowerCase().includes(domain.toLowerCase())
                    );

                    if (matchingDomain) {
                        foundDomainsMap.set(matchingDomain, true);

                        domainsFound.push({
                            website: site.website,
                            vendor: {
                                id: site.vendor?.id,
                                name: site.vendor?.name ?? undefined,
                                phone: site.vendor?.phone ?? undefined,
                                email: site.vendor?.email ?? undefined,
                            },
                            price: site.costPrice,
                            sellingPrice: site.sellingPrice || null,
                            discount: site.discount || null,
                        });
                    }
                });

                // Determine which domains were not found
                data.domains.forEach((domain: string) => {
                    if (!foundDomainsMap.has(domain)) {
                        domainsNotFound.push(domain);
                    }
                });
            } catch (dbError) {
                console.error("Database query failed:", dbError);
                throw new Error('Failed to fetch price data');
            }

            const responseData: PriceCheckerResponse['data'] = {
                domainsFound,
                domainsNotFound
            };

            return res.status(STATUS_CODES.OK).json(
                new APIResponse(STATUS_CODES.OK, "Price check completed", responseData, true)
            );
        } catch (error: any) {
            console.error("Error in priceChecker:", error);
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
                new APIError(
                    STATUS_CODES.INTERNAL_SERVER_ERROR,
                    "An error occurred while processing your request",
                    [],
                    false
                )
            );
        }
    },

    vendorChecker: async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            if (!req.body) {
                return res.status(STATUS_CODES.BAD_REQUEST).json(
                    new APIError(STATUS_CODES.BAD_REQUEST, "Request body is required", [], false)
                );
            }

            const { domains } = req.body;
            if (!domains || !Array.isArray(domains) || domains.length === 0) {
                return res.status(STATUS_CODES.BAD_REQUEST).json(
                    new APIError(
                        STATUS_CODES.BAD_REQUEST,
                        "Domains are required in the request body and must be a non-empty array",
                        [],
                        false
                    )
                );
            }

            // Validate all domains first
            for (const domain of domains) {
                if (typeof domain !== 'string') {
                    return res.status(STATUS_CODES.BAD_REQUEST).json(
                        new APIError(STATUS_CODES.BAD_REQUEST, `Invalid domain format for: ${domain}`, [], false)
                    );
                }
            }

            const domainsNotFound: string[] = [];
            const domainsFound: Record<string, Array<{
                vendorId: number;
                vendorName: string;
                vendorPhone: string | null;
                vendorEmail: string | null;
                costPrice: number;
                noOfOrders: number;
                latestOrderDate: Date | null;
            }>> = {};

            // Fetch all sites for all domains in a single query
            const allSites = await prismaClient.site.findMany({
                where: {
                    OR: domains.map(domain => ({
                        website: {
                            contains: domain,
                            mode: 'insensitive',
                        }
                    }))
                },
                include: {
                    vendor: true,
                },
            });

            // Group sites by domain
            const sitesByDomain: Record<string, typeof allSites> = {};
            for (const site of allSites) {
                const matchingDomain = domains.find(domain =>
                    site.website.toLowerCase().includes(domain.toLowerCase())
                );

                if (matchingDomain) {
                    if (!sitesByDomain[matchingDomain]) {
                        sitesByDomain[matchingDomain] = [];
                    }
                    sitesByDomain[matchingDomain].push(site);
                }
            }

            // Process domains that have no matching sites
            for (const domain of domains) {
                if (!sitesByDomain[domain]) {
                    domainsNotFound.push(domain);
                    continue;
                }
            }

            // Get all site IDs to fetch order data in bulk
            const allSiteIds = allSites.map(site => site.id);

            // Fetch all order counts in a single query
            const orderCounts = await prismaClient.order.groupBy({
                by: ['siteId'],
                where: {
                    siteId: {
                        in: allSiteIds
                    }
                },
                _count: {
                    id: true
                }
            });

            // Create a map of site ID to order count
            const orderCountMap = new Map();
            orderCounts.forEach(count => {
                orderCountMap.set(count.siteId, count._count.id);
            });

            // Fetch all latest order dates in a single query
            const latestOrderDates = await Promise.all(
                allSiteIds.map(siteId =>
                    prismaClient.order.findFirst({
                        where: { siteId },
                        orderBy: { orderDate: 'desc' },
                        select: { siteId: true, orderDate: true }
                    })
                )
            );

            // Create a map of site ID to latest order date
            const latestOrderDateMap = new Map();
            latestOrderDates.forEach(order => {
                if (order) {
                    latestOrderDateMap.set(order.siteId, order.orderDate);
                }
            });

            // Process the results for each domain
            for (const domain of domains) {
                if (sitesByDomain[domain]) {
                    domainsFound[domain] = [];

                    for (const site of sitesByDomain[domain]) {
                        domainsFound[domain].push({
                            vendorId: site.vendor?.id || 0,
                            vendorName: site.vendor?.name || '',
                            vendorPhone: site.vendor?.phone || null,
                            vendorEmail: site.vendor?.email || null,
                            costPrice: site.costPrice,
                            noOfOrders: orderCountMap.get(site.id) || 0,
                            latestOrderDate: latestOrderDateMap.get(site.id) || null,
                        });
                    }
                }
            }

            const responseData = {
                domainsFound,
                domainsNotFound,
            };

            const transformedResponse = transformDates(responseData);

            return res.status(STATUS_CODES.OK).json(
                new APIResponse(STATUS_CODES.OK, "Vendor check completed", transformedResponse, true)
            );
        } catch (error: any) {
            console.error("Error in vendorChecker:", error);
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
                new APIError(
                    STATUS_CODES.INTERNAL_SERVER_ERROR,
                    "An error occurred while processing your request",
                    [],
                    false
                )
            );
        }
    },

    categoryLinks: async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const { body } = req;
            if (!body.domains || !Array.isArray(body.domains)) {
                return res.status(STATUS_CODES.BAD_REQUEST).json(
                    new APIError(STATUS_CODES.BAD_REQUEST, "Domains are required in the request body and must be an array", [], false)
                );
            }

            const category = body.category;
            if (!category || typeof category !== 'string') {
                return res.status(STATUS_CODES.BAD_REQUEST).json(
                    new APIError(STATUS_CODES.BAD_REQUEST, "Category is required in the request body and must be a string", [], false)
                );
            }

            // Validate all domains first
            for (const domain of body.domains) {
                if (typeof domain !== 'string') {
                    return res.status(STATUS_CODES.BAD_REQUEST).json(
                        new APIError(STATUS_CODES.BAD_REQUEST, `Invalid domain format for: ${domain}`, [], false)
                    );
                }
            }

            // Make a single database query for all domains
            const sites = await prismaClient.categoryLinks.findMany({
                where: {
                    site: {
                        in: body.domains,
                        mode: 'insensitive',
                    },
                    category: {
                        contains: category,
                        mode: 'insensitive',
                    }
                },
            });

            // Create a lookup map for faster access
            const siteMap = new Map<string, CategoryLinkItem>();
            sites.forEach(site => {
                siteMap.set(site.site.toLowerCase(), {
                    website: site.site,
                    category: category,
                    categoryLink: site.categoryLink
                });
            });

            const notFoundDomains: string[] = [];
            // Build the response
            const responseData: CategoryLinkItem[] = body.domains.map((domain: string) => {
                const normalizedDomain = domain.toLowerCase();
                const foundSite = siteMap.get(normalizedDomain);

                if (foundSite) {
                    return foundSite;
                }
                notFoundDomains.push(domain);
                return {
                    website: domain,
                    category: category,
                    categoryLink: "Not Found"
                };
            });

            const url = process.env.WEBSITE_CATEGORY_NOT_FOUND_URL || 'http://localhost:3000/category-not-found';
            const success = await httpClient.post(
                url,
                {
                    domains: notFoundDomains,
                }
            ).then((response) => {
            }).catch((error) => {
                console.error('Error sending category not found data:', error);
            }
            )

            const response: categoryLinksResponse["data"] = {
                data: responseData
            };

            return res.status(STATUS_CODES.OK).json(
                new APIResponse(STATUS_CODES.OK, "Category links fetched successfully", response, true)
            );

        } catch (e) {
            console.error("Error in categoryLinks:", e);
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
                new APIError(
                    STATUS_CODES.INTERNAL_SERVER_ERROR,
                    "An error occurred while processing your request",
                    [],
                    false
                )
            );
        }
    }
    ,
    addTrashDomains: async (req: AuthRequest, res: Response): Promise<Response> => {
        const user = req.user;
        if (!user) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json(
                new APIError(STATUS_CODES.UNAUTHORIZED, "User not authenticated", [], false)
            );
        }

        const permissions = await getPermissionCached(user.userId);
        const isAllowed = permissions.some((p) => p.name === '_tools_6');

        if (!isAllowed) {
            return res.status(STATUS_CODES.FORBIDDEN).json(
                new APIError(STATUS_CODES.FORBIDDEN, "You are not authorized to access this route", [], false)
            );
        }

        try {
            if (!req.body) {
                return res.status(STATUS_CODES.BAD_REQUEST).json(
                    new APIError(STATUS_CODES.BAD_REQUEST, "Request body is required", [], false)
                );
            }

            const data = req.body;
            if (!data.domains || !Array.isArray(data.domains)) {
                return res.status(STATUS_CODES.BAD_REQUEST).json(
                    new APIError(STATUS_CODES.BAD_REQUEST, "Domains are required in the request body and must be an array", [], false)
                );
            }

            const domains = data.domains;
            const pitchedFrom = data.pitchedFrom ? data.pitchedFrom : null;

            const newData = await prismaClient.trashSites.createMany({
                data: domains.map((domain: string) => ({
                    website: domain,
                    pitchedFrom: pitchedFrom,
                })),
                skipDuplicates: true,
            });

            return res.status(STATUS_CODES.OK).json(
                new APIResponse(STATUS_CODES.OK, "Trash domains added successfully", {}, true)
            );
        } catch (error: any) {
            console.error("Error in addTrashDomains:", error);
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
                new APIError(
                    STATUS_CODES.INTERNAL_SERVER_ERROR,
                    "An error occurred while processing your request",
                    [],
                    false
                )
            );

        }
    },

    nicheDomains: async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            // Group sites by pureCategory and count them
            const nicheGroups = await prismaClient.site.groupBy({
                by: ['pureCategory'],
                _count: {
                    pureCategory: true
                },
                orderBy: {
                    _count: {
                        pureCategory: 'desc'
                    }
                }
            });

            // Transform the data into a more readable format, mapping pureCategory to niche
            const nicheData = nicheGroups.map(group => ({
                niche: group.pureCategory,
                count: group._count.pureCategory
            }));

            return res.status(STATUS_CODES.OK).json(
                new APIResponse(STATUS_CODES.OK, "Niche domains fetched successfully", { niches: nicheData }, true)
            );
        } catch (error: any) {
            console.error("Error in nicheDomains:", error);
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
                new APIError(
                    STATUS_CODES.INTERNAL_SERVER_ERROR,
                    "An error occurred while processing your request",
                    [],
                    false
                )
            );
        }
    },

    getDispatchedDomains: async (req: AuthRequest, res: Response): Promise<Response> => {

        try {
            const body = req.body;
            if (!body) {
                return res.status(STATUS_CODES.BAD_REQUEST).json(
                    new APIError(STATUS_CODES.BAD_REQUEST, "Request body is required", [], false)
                );
            }

            const domains: string[] = body.domains;
            const client = body.client;
            if (!domains || !Array.isArray(domains) || domains.length === 0) {
                return res.status(STATUS_CODES.BAD_REQUEST).json(
                    new APIError(STATUS_CODES.BAD_REQUEST, "Domains are required in the request body and must be a non-empty array", [], false)
                );
            }

            if (!client || typeof client !== 'string') {
                return res.status(STATUS_CODES.BAD_REQUEST).json(
                    new APIError(STATUS_CODES.BAD_REQUEST, "Client is required in the request body and must be a string", [], false)
                )
            }

            const repsone: getDispatchedDomainsResponse["data"] = {
                dispatchedDomains: [],
                previousDispatchedDomains: [],
                freshDomeains: []
            };


            for (const domain in domains) {
                const site = await prismaClient.dispatechDomains.findFirst({
                    where: {
                        domain: {
                            contains: domain,
                            mode: 'insensitive',
                        },
                        client: {
                            contains: client,
                            mode: 'insensitive',
                        }
                    },
                    select: {
                        domain: true,
                        client: true,
                        poc: true,
                        costPrice: true,
                        dispatchedDate: true,
                        project: true
                    }
                });
                if (site) {
                    // Calculate date from 3 months ago
                    const threeMonthsAgo = new Date();
                    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

                    if (site.dispatchedDate && site.dispatchedDate < threeMonthsAgo) {
                        repsone.previousDispatchedDomains.push({
                            domain: site.domain,
                            costPrice: site.costPrice,
                            client: site.client,
                            poc: site.poc,
                            dispatchDate: site.dispatchedDate,
                            project: site.project
                        });
                    } else {
                        repsone.dispatchedDomains.push({
                            domain: site.domain,
                            costPrice: site.costPrice,
                            client: site.client,
                            poc: site.poc,
                            dispatchDate: site.dispatchedDate,
                            project: site.project
                        });
                    }
                } else {
                    repsone.freshDomeains.push(domain);
                }
            }

            return res.status(STATUS_CODES.OK).json(
                new APIResponse(STATUS_CODES.OK, "Dispatched domains fetched successfully", repsone, true)
            );

        } catch (error: any) {
            console.error("Error in getDispatchedDomains:", error);
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
                new APIError(
                    STATUS_CODES.INTERNAL_SERVER_ERROR,
                    "An error occurred while processing your request",
                    [],
                    false
                )
            );
        }
    },

    addDispatchedDomains: async (req: AuthRequest, res: Response): Promise<Response> => {

        try {
            const domains: addDispatchedDomainsRequest["domains"] = req.body;

            if (!domains || !Array.isArray(domains) || domains.length === 0) {
                return res.status(STATUS_CODES.BAD_REQUEST).json(
                    new APIError(STATUS_CODES.BAD_REQUEST, "Domains are required in the request body and must be a non-empty array", [], false)
                );
            }

            for (const domain of domains) {

                const site = await prismaClient.dispatechDomains.create({
                    data: {
                        domain: domain.domain,
                        client: domain.client,
                        poc: domain.poc,
                        costPrice: domain.costPrice,
                        project: domain.project
                    },

                }
                );
            }

            return res.status(STATUS_CODES.OK).json(
                new APIResponse(STATUS_CODES.OK, "Dispatched domains added successfully", {}, true)
            );
        } catch (error: any) {

            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
                new APIError(
                    STATUS_CODES.INTERNAL_SERVER_ERROR,
                    "An error occurred while processing your request",
                    [],
                    false
                )
            );
        }
    }
}




import { PriceCheckerResponse, VendorCheckerResponse, WebsiteCheckerResponse } from "@shared/types";
import { Response } from "express";
import STATUS_CODES from "../constants/statusCodes";
import { AuthRequest } from "../types/sitesDataTypes";
import { APIError, APIResponse } from "../utils/apiHandler";
import { prismaClient } from "../utils/prismaClient";

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

            const duplicates: string[] = [];
            const newDomains: string[] = [];

            try {
                await Promise.all(
                    data.domains.map(async (domain: string) => {
                        if (typeof domain !== 'string') {
                            throw new Error('Invalid domain format');
                        }

                        const found = await prismaClient.site.findMany({
                            where: {
                                website: {
                                    contains: domain,
                                    mode: 'insensitive',
                                }
                            }
                        });
                        if (found.length > 0) {
                            duplicates.push(domain);
                        } else {
                            newDomains.push(domain);
                        }
                    })
                );
            } catch (dbError) {
                console.error("Database operation failed:", dbError);
                throw new Error('Failed to process domains');
            }

            const response: WebsiteCheckerResponse["data"] = {
                duplicates,
                newDomains
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

            const pricesMap: { [key: string]: PriceCheckerResponse['data'] } = {};

            try {
                for (const domain of data.domains) {
                    if (typeof domain !== 'string') {
                        throw new Error(`Invalid domain format for: ${domain}`);
                    }

                    const sites = await prismaClient.site.findMany({
                        where: {
                            website: {
                                contains: domain,
                                mode: 'insensitive',
                            },
                        },
                        include: {
                            vendor: true,
                        },
                    });

                    const result: PriceCheckerResponse['data'] = sites.map((site) => ({
                        website: site.website,
                        vendor: {
                            id: site.vendor?.id,
                            name: site.vendor?.name,
                            phone: site.vendor?.phone,
                            email: site.vendor?.email,
                            country: site.vendor_country || null,
                        },
                        price: site.price,
                        sailingPrice: site.sailing_price || null,
                        discount: site.discount || null,
                    }));

                    pricesMap[domain] = result;
                }
            } catch (dbError) {
                console.error("Database query failed:", dbError);
                throw new Error('Failed to fetch price data');
            }

            return res.status(STATUS_CODES.OK).json(
                new APIResponse(STATUS_CODES.OK, "Price check completed", { prices: pricesMap }, true)
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

            const data = req.body;
            if (!data.domains || !Array.isArray(data.domains) || data.domains.length === 0) {
                return res.status(STATUS_CODES.BAD_REQUEST).json(
                    new APIError(STATUS_CODES.BAD_REQUEST, "Domains are required in the request body and must be a non-empty array", [], false)
                );
            }

            const vendorsMap: { [key: string]: any[] } = {};

            try {
                for (const domain of data.domains) {
                    if (typeof domain !== 'string') {
                        throw new Error(`Invalid domain format for: ${domain}`);
                    }

                    const sites = await prismaClient.site.findMany({
                        where: {
                            website: {
                                contains: domain,
                                mode: 'insensitive',
                            },
                        },
                        include: {
                            vendor: true,
                        },
                    });

                    vendorsMap[domain] = sites.map((site) => ({
                        vendorId: site.vendor?.id,
                        vendorName: site.vendor?.name,
                        vendorPhone: site.vendor?.phone,
                        vendorEmail: site.vendor?.email,
                        vendorCountry: site.vendor_country || null,
                    }));
                }
            } catch (dbError) {
                console.error("Database operation failed:", dbError);
                throw new Error('Failed to fetch vendor data');
            }

            const response: VendorCheckerResponse["data"] = {
                vendors: vendorsMap,
            };

            return res.status(STATUS_CODES.OK).json(
                new APIResponse(STATUS_CODES.OK, "Vendor check completed", response, true)
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
    }
};

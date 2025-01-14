import { Response } from "express";
import STATUS_CODES from "src/constants/statusCodes";
import { AuthRequest } from "src/types/sitesDataTypes";
import { APIError, APIResponse } from "src/utils/apiHandler";
import { prismaClient } from "src/utils/prismaClient";



export const toolsController = {

    websiteChecker: async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const data = req.body;
            let duplicates: string[] = [];
            let newDomains: string[] = [];

            data.domains.forEach(async (domain: string) => {
                const found = await prismaClient.site.findMany({
                    where: {
                        website: {
                            contains: domain
                        }
                    }
                });
                if (found) {
                    duplicates.push(domain);
                } else {
                    newDomains.push(domain);
                }
            })

            const response = {
                duplicates: duplicates,
                newDomains: newDomains
            }

            return res.status(STATUS_CODES.OK).json(new APIResponse(STATUS_CODES.OK, "Website check completed", response, true));
        } catch (error: any) {
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(new APIError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message, [], false));
        }
    },

    priceChecker: async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const domain = req.body.domain;

            if (!domain) {
                return res.status(400).json({
                    error: "Domain is required in the request body.",
                });
            }

            const data = await prismaClient.site.findMany({
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


            if (data.length === 0) {
                return res.status(STATUS_CODES.NOT_FOUND).json(new APIError(STATUS_CODES.NOT_FOUND, "No data found for the given domain.", [], false));
            }

            const result = data.map((site) => ({
                website: site.website,
                vendor: {
                    id: site.vendor.id,
                    name: site.vendor.name,
                    phone: site.vendor.phone,
                    email: site.vendor.email,
                    country: site.vendor_country || null,
                },
                price: site.price,
                sailingPrice: site.sailing_price || null,
                discount: site.discount || null,
            }));

            // Return the results
            return res.status(STATUS_CODES.OK).json(new APIResponse(STATUS_CODES.OK, "Price check completed", result, true));
        } catch (error) {
            console.error("Error in priceChecker:", error);

            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(new APIError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Internal server error", [], false));
        }
    }

}
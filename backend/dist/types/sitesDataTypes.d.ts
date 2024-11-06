export interface SiteQueryParams {
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    daMin?: string;
    daMax?: string;
    paMin?: string;
    paMax?: string;
    priceMin?: string;
    priceMax?: string;
    trafficMin?: string;
    trafficMax?: string;
    spamScoreMin?: string;
    spamScoreMax?: string;
    drMin?: string;
    drMax?: string;
    organicTrafficMin?: string;
    organicTrafficMax?: string;
    numOfLinksMin?: string;
    numOfLinksMax?: string;
    bannerImagePriceMin?: string;
    bannerImagePriceMax?: string;
    follow?: string | string[];
    price_category?: string | string[];
    vendor_invoice_status?: string | string[];
    website_type?: string | string[];
    website_status?: string | string[];
    website_quality?: string | string[];
    niche?: string | string[];
    site_category?: string | string[];
    language?: string | string[];
    vendor_country?: string | string[];
    web_country?: string | string[];
    adult?: string;
    casino_adult?: string;
    social_media_posting?: string;
    createdAtStart?: string;
    createdAtEnd?: string;
    cpUpdateDateStart?: string;
    cpUpdateDateEnd?: string;
    semrushUpdationDateStart?: string;
    semrushUpdationDateEnd?: string;
    website?: string;
    person?: string;
}
export interface SitesResponse {
    success: boolean;
    data: any[];
    totalRecords: number;
    page: number;
    pageSize: number;
}
import { Request } from 'express';
export interface Resource {
    id: number;
    tableId: string;
    columns: string[];
    description: string;
}
export interface JwtPayload {
    email: string;
    userId: number;
    role: string;
    permissions: {
        key: string;
        description: string;
    }[];
    resources: {
        key: string;
        columns: string[];
    }[];
    iat: number;
    exp: number;
}
export interface AuthRequest extends Request {
    user?: JwtPayload;
    permittedColumns?: string[];
    columnTypes?: {
        [key: string]: string;
    };
    modelName?: string;
    view?: any;
    userViews?: {
        id: number;
        viewName: string;
    }[];
}

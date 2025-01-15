import { apiRequest } from './APIService';
import { PriceCheckerResponse, VendorCheckerResponse, WebsiteCheckerResponse } from '../../../../shared/src/types';


export async function duplicateWebsiteChecker(
    domains: string[])
    : Promise<WebsiteCheckerResponse> {
    return apiRequest<WebsiteCheckerResponse>('/tools/website-checker', 'POST', undefined, {
        domains
    });
}

export async function priceChecker(
    domains: string[]): Promise<PriceCheckerResponse> {
    return apiRequest<PriceCheckerResponse>('/tools/price-checker', 'POST', undefined, {
        domains
    });
}

export async function vendorChecker(
    domains: string[]): Promise<VendorCheckerResponse> {
    return apiRequest<VendorCheckerResponse>('/tools/vendor-checker', 'POST', undefined, {
        domains
    });
}
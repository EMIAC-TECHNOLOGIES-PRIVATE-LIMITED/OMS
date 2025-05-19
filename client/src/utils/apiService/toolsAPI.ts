import { apiRequest } from './APIService';
import { addDispatchedDomainsRequest, addDispatchedDomainsResponse, categoryLinksResponse, getDispatchedDomainsResponse, getSitesAiResponse, liveMatricsResponse, nicheDomainsResponse, PriceCheckerResponse, VendorCheckerResponse, WebsiteCheckerResponse } from '../../../../shared/src/types';


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

export async function categoryLinkFetcher(domains: string[], category: string): Promise<any> {
    return apiRequest<categoryLinksResponse>('/tools/category-links', 'POST', undefined, {
        domains,
        category
    });
}


export async function addTrashDomains(domains: string[], pitchedFrom?: string): Promise<any> {
    return apiRequest('/tools/add-trash-domains', 'POST', undefined, {
        domains,
        pitchedFrom
    });
}

export async function nicheDomains(): Promise<any> {
    return apiRequest<nicheDomainsResponse>('/tools/niche-domains', 'GET');
}


export async function getDispatchedDomains(): Promise<any> {
    return apiRequest<getDispatchedDomainsResponse>('/tools/get-dispatchedDomains', 'GET', undefined, {});
}

export async function addDispatchedDomains(data: addDispatchedDomainsRequest): Promise<any> {
    return apiRequest<addDispatchedDomainsResponse>('/tools/add-dispatchedDomains', 'POST', undefined, data);
}

export async function getLiveMatrics(data: string[]): Promise<liveMatricsResponse> {
    return apiRequest<liveMatricsResponse>('/tools/get-live-matrics', 'POST', undefined, {
        domains: data
    });
}

export async function getSitesAi(userMessage: string, query?: JSON, order?: JSON, page?: number, pageSize?: number): Promise<any> {
    return apiRequest<getSitesAiResponse>('/tools/get-sites', 'POST', undefined, {
        userMessage,
        query,
        order,
        page,
        pageSize
    });
}
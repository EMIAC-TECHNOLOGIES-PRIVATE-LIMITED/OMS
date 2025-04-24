import { SiteCategory } from '@/types/adminTable';
import { apiRequest } from './APIService';

const requestTracker: { [key: string]: AbortController } = {};

export async function typeAheadAPI(
    route: string,
    column: string,
    value: string,
    options: { timeout?: number } = {}
): Promise<any> {
    const requestKey = `${route}-${column}-${value}`;

    // Cancel any existing request for this key
    if (requestTracker[requestKey]) {
        requestTracker[requestKey].abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    requestTracker[requestKey] = controller;

    // Optional timeout to auto-cancel long-running requests
    const timeoutId = options.timeout ? setTimeout(() => {
        controller.abort();
    }, options.timeout) : null;

    try {
        const response = await apiRequest<any>(
            `/search/${route}?column=${column}&value=${value}`,
            'GET'
        );

        // Clear timeout and tracking
        if (timeoutId) clearTimeout(timeoutId);
        delete requestTracker[requestKey];

        return response;
    } catch (error) {
        // Clear timeout and tracking
        if (timeoutId) clearTimeout(timeoutId);
        delete requestTracker[requestKey];

        // Re-throw if not an abort error
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
            throw error;
        }

        return [];
    }
}


export async function getSuggestions(
    route: string,
    column: string,
    value: string,
    options: { timeout?: number } = {}
): Promise<any> {
    const requestKey = `${route}-${column}-${value}`;

    // Cancel any existing request for this key
    if (requestTracker[requestKey]) {
        requestTracker[requestKey].abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    requestTracker[requestKey] = controller;

    // Optional timeout to auto-cancel long-running requests
    const timeoutId = options.timeout ? setTimeout(() => {
        controller.abort();
    }, options.timeout) : null;

    try {
        const response = await apiRequest<any>(
            `/search/${route}?column=${column}&value=${value}`,
            'GET'
        );

        // Clear timeout and tracking
        if (timeoutId) clearTimeout(timeoutId);
        delete requestTracker[requestKey];

        return response;
    } catch (error) {
        // Clear timeout and tracking
        if (timeoutId) clearTimeout(timeoutId);
        delete requestTracker[requestKey];

        // Re-throw if not an abort error
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
            throw error;
        }

        return [];
    }
}

export async function getSitesWithVendor(
    site: string,
    options: { timeout?: number } = {}
): Promise<any> {
    const requestKey = `siteWithVendors-${site}`;

    // Cancel any existing request for this key
    if (requestTracker[requestKey]) {
        requestTracker[requestKey].abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    requestTracker[requestKey] = controller;

    // Optional timeout to auto-cancel long-running requests
    const timeoutId = options.timeout ? setTimeout(() => {
        controller.abort();
    }, options.timeout) : null;

    try {
        const response = await apiRequest<any>(
            `/search/siteWithVendors?site=${site}`,
            'GET'
        );

        // Clear timeout and tracking
        if (timeoutId) clearTimeout(timeoutId);
        delete requestTracker[requestKey];

        return response;
    } catch (error) {
        // Clear timeout and tracking
        if (timeoutId) clearTimeout(timeoutId);
        delete requestTracker[requestKey];

        // Re-throw if not an abort error
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
            throw error;
        }

        return [];
    }
};

export async function getSearchResults(
    route: string,
    id: number,
): Promise<any> {
    try {
        const response = await apiRequest<any>(
            `/search/${route}/${id}`,
            'GET'
        );

        return response;
    }
    catch (error) {
        return [];
    }
}



export async function getSiteCategories(input: string): Promise<any> {
    try {
        const response: SiteCategory[] = await apiRequest<any>(
            `/search/siteCategories?siteCategory=${input}`,
            'GET'
        );
        return response;
    }
    catch (error) {
        return [];
    }
}
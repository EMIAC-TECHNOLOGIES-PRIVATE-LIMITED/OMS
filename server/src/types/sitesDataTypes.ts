export type BackendColumnType =
    | 'Int'
    | 'String'
    | 'BigInt'
    | 'DateTime'
    | 'Boolean'; // Ensure all possible types are included

export type FrontendColumnType = 'number' | 'string' | 'boolean' | 'date';

// Available Columns Interface
export interface AvailableColumns {
    [key: string]: BackendColumnType;
}

// Filter and Sorting Interfaces
export interface FilterCondition {
    column: string;
    operator: string;
    value: any;
}

export interface SortingOption {
    column: string;
    direction: 'asc' | 'desc';
}



// FilterComponent Props Interface
export interface FilterComponentProps {
    availableColumns: AvailableColumns;
    onApply: (filterConfig: FilterConfig) => void;
}

// Response Interfaces
export interface CreateViewResponse {
    success: boolean;
    view: {
        id: number;
        viewName: string;
        // ... other view-related fields
    };
}

export interface GetViewDataResponse {
    success: boolean;
    totalRecords: number;
    page: number;
    pageSize: number;
    data: WebsiteData[];
    availableColumns: AvailableColumns;
    appliedFilters: Record<string, any>;
    appliedSorting: SortingOption[];
    appliedGrouping: string[];
    views: View[];
}

// Website Data Interface
export interface WebsiteData {
    id: number;
    website: string;
    niche: string | null;
    site_category: string | null;
    da: number;
    pa: number;
    person: string;
    person_id: number;
    price: number;
    sailing_price: number;
    discount: number;
    adult: number;
    casino_adult: number;
    contact: string;
    contact_from: string;
    web_category: string;
    follow: string;
    price_category: string;
    traffic: number;
    spam_score: number | null;
    cbd_price: number;
    remark: string;
    contact_from_id: string;
    vendor_country: string;
    phone_number: number;
    sample_url: string;
    bank_details: string;
    dr: number;
    user_id: number;
    timestamp: string;
    web_ip: string;
    web_country: string;
    link_insertion_cost: string;
    tat: string;
    social_media_posting: string;
    semrush_traffic: number;
    semrush_first_country_name: string;
    semrush_first_country_traffic: number;
    semrush_second_country_name: string;
    semrush_second_country_traffic: number;
    semrush_third_country_name: string;
    semrush_third_country_traffic: number;
    semrush_fourth_country_name: string;
    semrush_fourth_country_traffic: number;
    semrush_fifth_country_name: string;
    semrush_fifth_country_traffic: number;
    similarweb_traffic: number;
    vendor_invoice_status: string;
    main_category: string;
    site_update_date: string;
    website_type: string;
    language: string;
    gst: string;
    disclaimer: string;
    anchor_text: string;
    banner_image_price: number;
    cp_update_date: string;
    pure_category: string;
    availability: string;
    indexed_url: string;
    website_status: string;
    website_quality: string;
    num_of_links: number;
    semrush_updation_date: string;
    organic_traffic: number;
    organic_traffic_last_update_date: string;
    created_at: string;
}



// JwtPayload Interface
export interface JwtPayload {
    email: string;
    userId: number;
    role: {
        id: number;
        name: string
    }
    userAccess: number[];
}

// Resource Interface
export interface Resource {
    id: number;
    tableId: string;
    columns: string[];
    description: string;
}

import { FilterConfig, View } from '@shared/types';
// AuthRequest Interface
import { Request } from 'express';

export interface AuthRequest extends Request {
    user?: JwtPayload;
    permittedColumns?: string[];
    columnTypes?: { [key: string]: string };
    modelName?: string;
    view?: View;
    userViews?: { id: number; viewName: string }[];
    filterConfig?: FilterConfig
}

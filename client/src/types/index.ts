// export type BackendColumnType =
//   | 'Int'
//   | 'String'
//   | 'BigInt'
//   | 'DateTime'
//   | 'Boolean'; // Ensure all possible types are included

// export type FrontendColumnType = 'number' | 'string' | 'boolean' | 'date';

// // Available Columns Interface for Frontend
// export interface FrontendAvailableColumns {
//   [key: string]: {
//     label: string;
//     type: BackendColumnType;
//   };
// }

// // Available Columns Interface for Backend
// export interface BackendAvailableColumns {
//   [key: string]: BackendColumnType;
// }

// // Filter and Sorting Interfaces
// export interface FilterCondition {
//   column: string;
//   operator: string;
//   value: any;
// }


// export interface SortingOption {
//   [x: string]: "asc" | "desc";
// }

// // export interface SortingOption {
// //   column: string;
// //   direction: 'asc' | 'desc';
// // }

// export interface FilterConfig {
//   columns: string[];
//   filters: ExtendedFilterCondition[];
//   globalConnector: 'AND' | 'OR';
//   sorting: SortingOption[];
//   grouping: string[];
// }

// // FilterComponent Props Interface
// export interface FilterComponentProps {
//   availableColumns: FrontendAvailableColumns;
//   initialFilterConfig?: FilterConfig;
//   currentFilterConfig?: FilterConfig;
//   page: number
//   pageSize: number
//   totalRecords: number
//   onPageChange: (page?: number, pageSize?: number) => void;
//   onFilterChange: (filterConfig: FilterConfig) => void;
// }

// // Response Interfaces
// export interface CreateViewResponse {
//   success: boolean;
//   view: {
//     id: number;
//     viewName: string;
//     // ... other view-related fields
//   };
// }

// export interface GetViewDataResponse {
//   success: boolean;
//   totalRecords: number;
//   viewId: {
//     id: number,
//     columns: string[]
//     viewName: string
//   };
//   page: number;
//   pageSize: number;
//   data: WebsiteData[];
//   availableColumns: BackendAvailableColumns;
//   appliedFilters: Record<string, any>;
//   appliedSorting: SortingOption[];
//   appliedGrouping: string[];
//   views: View[];
// }

// // Website Data Interface
// export interface WebsiteData {
//   id: number;
//   website: string;
//   niche: string | null;
//   site_category: string | null;
//   da: number;
//   pa: number;
//   person: string;
//   person_id: number;
//   price: number;
//   sailing_price: number;
//   discount: number;
//   adult: number;
//   casino_adult: number;
//   contact: string;
//   contact_from: string;
//   web_category: string;
//   follow: string;
//   price_category: string;
//   traffic: number;
//   spam_score: number | null;
//   cbd_price: number;
//   remark: string;
//   contact_from_id: string;
//   vendor_country: string;
//   phone_number: number;
//   sample_url: string;
//   bank_details: string;
//   dr: number;
//   user_id: number;
//   timestamp: string;
//   web_ip: string;
//   web_country: string;
//   link_insertion_cost: string;
//   tat: string;
//   social_media_posting: string;
//   semrush_traffic: number;
//   semrush_first_country_name: string;
//   semrush_first_country_traffic: number;
//   semrush_second_country_name: string;
//   semrush_second_country_traffic: number;
//   semrush_third_country_name: string;
//   semrush_third_country_traffic: number;
//   semrush_fourth_country_name: string;
//   semrush_fourth_country_traffic: number;
//   semrush_fifth_country_name: string;
//   semrush_fifth_country_traffic: number;
//   similarweb_traffic: number;
//   vendor_invoice_status: string;
//   main_category: string;
//   site_update_date: string;
//   website_type: string;
//   language: string;
//   gst: string;
//   disclaimer: string;
//   anchor_text: string;
//   banner_image_price: number;
//   cp_update_date: string;
//   pure_category: string;
//   availability: string;
//   indexed_url: string;
//   website_status: string;
//   website_quality: string;
//   num_of_links: number;
//   semrush_updation_date: string;
//   organic_traffic: number;
//   organic_traffic_last_update_date: string;
//   created_at: string;
// }

// export interface VendorData {
//   vendorId: number;
//   name: string;
//   phone: string;
//   email: string;
//   contactedFrom: string;
//   bankName: string;
//   accountNumber: string;
//   ifscCode: string;
//   paypalId: string;
//   userId: number;
//   timestamp: string;
//   skypeId: string;
//   upiId: string;
// }

// export interface ExtendedFilterCondition extends FilterCondition {
//   id: string;
//   connector: 'AND' | 'OR';
//   column: string;
//   operator: string;
//   value: string;
// }

// // View Interface
// export interface View {
//   id: number;
//   viewName: string;
//   // ... other view-related fields
// }

// // JwtPayload Interface
// export interface JwtPayload {
//   email: string;
//   userId: number;
//   role: string;
//   permissions: { key: string; description: string }[];
//   resources: { key: string; columns: string[] }[];
//   iat: number;
//   exp: number;
// }

// // Resource Interface
// export interface Resource {
//   id: number;
//   tableId: string;
//   columns: string[];
//   description: string;
// }

// // AuthRequest Interface

// export interface AuthRequest extends Request {
//   user?: JwtPayload;
//   permittedColumns?: string[];
//   columnTypes?: { [key: string]: string };
//   modelName?: string;
//   view?: any;
//   userViews?: { id: number; viewName: string }[];
// }

export interface availableColumnsTypes { [key: string]: string };

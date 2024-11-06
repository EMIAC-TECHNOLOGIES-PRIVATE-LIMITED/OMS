export interface ResponseData {
    success: boolean;
    totalRecords: number;
    page: number;
    pageSize: number;
    data: WebsiteData[];
    availableColumns: Record<string, string>;
    appliedFilters: Record<string, unknown>;
    appliedSorting: Array<unknown>;
    appliedGrouping: Array<unknown>;
    views: View[];
  }
  
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
    traffic: bigint;
    spam_score: number | null;
    cbd_price: number;
    remark: string;
    contact_from_id: string;
    vendor_country: string;
    phone_number: bigint;
    sample_url: string;
    bank_details: string;
    dr: number;
    user_id: number;
    timestamp: string; // ISO Date string format
    web_ip: string;
    web_country: string;
    link_insertion_cost: string;
    tat: string;
    social_media_posting: string;
    semrush_traffic: bigint;
    semrush_first_country_name: string;
    semrush_first_country_traffic: bigint;
    semrush_second_country_name: string;
    semrush_second_country_traffic: bigint;
    semrush_third_country_name: string;
    semrush_third_country_traffic: bigint;
    semrush_fourth_country_name: string;
    semrush_fourth_country_traffic: bigint;
    semrush_fifth_country_name: string;
    semrush_fifth_country_traffic: bigint;
    similarweb_traffic: bigint;
    vendor_invoice_status: string;
    main_category: string;
    site_update_date: string; // ISO Date string format
    website_type: string;
    language: string;
    gst: string;
    disclaimer: string;
    anchor_text: string;
    banner_image_price: number;
    cp_update_date: string; // ISO Date string format
    pure_category: string;
    availability: string;
    indexed_url: string;
    website_status: string;
    website_quality: string;
    num_of_links: number;
    semrush_updation_date: string; // ISO Date string format
    organic_traffic: bigint;
    organic_traffic_last_update_date: string; // ISO Date string format
    created_at: string; // ISO Date string format
  }
  
  export interface View {
    id: number;
    viewName: string;
  }
  
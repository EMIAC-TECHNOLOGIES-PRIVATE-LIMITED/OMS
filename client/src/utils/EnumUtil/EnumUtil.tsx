import { Badge } from "@/components/ui/badge"
import { useCallback } from "react"

type StatusColorConfig = {
    enum: 'ClientPaymentStatus' | 'VendorPaymentStatus' | 'OrderStatus' | 'VendorInvoiceStatus' | 'SiteClassification' | 'linkAttribute' | 'PriceCategory' | 'WebsiteType' | 'WebsiteStatus' | 'WebsiteQuality' | 'VendorCategory';
    value: string;
};

// Define mapped types for each enum's possible values
type ClientPaymentStatusValues = 'Received' | 'PartiallyReceived' | 'Pending' | 'NotReceived';
type VendorPaymentStatusValues = 'Hold' | 'Unpaid' | 'Paid' | 'PartiallyPaid' | 'Cancel';
type OrderStatusValues = 'Pending' | 'Given' | 'Publish' | 'NotPublish' | 'Cancel' | 'Replacement' | 'NeedUpdate' | 'Order_Replaced';
type VendorInvoiceStatusValues = 'Pending' | 'Ask' | 'Received' | 'Given' | 'Paid';
type SiteClassificationValues = 'Normal' | 'Casino' | 'Cbd' | 'Adult' | 'Organic' | 'Crypto';
type linkAttribute = 'DoFollow' | 'NoFollow' | 'Sponsored';
type PriceCategory = 'Paid' | 'Free' | 'Exchange';
type WebsiteType = 'Default' | 'PR' | 'Language' | 'PR_Brand' | 'PR_NonBrand';
type WebsiteStatus = 'Normal' | 'Blacklist' | 'Disqualified';
type WebsiteQuality = 'Pure' | 'AlmostPure' | 'Multi';
type VendorCategory = 'Individual' | 'Agency';

// Utility function to get background color based on enum and value
const useStatusColor = () => {
    return useCallback(({ enum: enumType, value }: StatusColorConfig): string => {
        switch (enumType) {
            case 'ClientPaymentStatus':
                switch (value as ClientPaymentStatusValues) {
                    case 'Received': return 'bg-green-600';
                    case 'PartiallyReceived': return 'bg-yellow-600';
                    case 'Pending': return 'bg-blue-600';
                    case 'NotReceived': return 'bg-red-600';
                }
                break;

            case 'VendorPaymentStatus':
                switch (value as VendorPaymentStatusValues) {
                    case 'Hold': return 'bg-yellow-300';
                    case 'Unpaid': return 'bg-red-600';
                    case 'Paid': return 'bg-green-600';
                    case 'PartiallyPaid': return 'bg-yellow-600';
                    case 'Cancel': return 'bg-gray-600';
                }
                break;

            case 'OrderStatus':
                switch (value as OrderStatusValues) {
                    case 'Pending': return 'bg-yellow-600';
                    case 'Given': return 'bg-blue-600';
                    case 'Publish': return 'bg-green-600';
                    case 'NotPublish': return 'bg-red-600';
                    case 'Cancel': return 'bg-gray-600';
                    case 'Replacement': return 'bg-purple-600';
                    case 'NeedUpdate': return 'bg-orange-600';
                    case 'Order_Replaced': return 'bg-slate-600';
                }
                break;

            case 'VendorInvoiceStatus':
                switch (value as VendorInvoiceStatusValues) {
                    case 'Pending': return 'bg-yellow-600';
                    case 'Ask': return 'bg-blue-600';
                    case 'Received': return 'bg-green-600';
                    case 'Given': return 'bg-purple-600';
                    case 'Paid': return 'bg-teal-600';
                }
                break;

            case 'SiteClassification':
                switch (value as SiteClassificationValues) {
                    case 'Normal': return 'bg-green-600';
                    case 'Casino': return 'bg-purple-600';
                    case 'Cbd': return 'bg-yellow-600';
                    case 'Adult': return 'bg-red-600';
                    case 'Organic': return 'bg-green-600';
                    case 'Crypto': return 'bg-blue-600';
                }
                break;

            case 'linkAttribute':
                switch (value as linkAttribute) {
                    case 'DoFollow': return 'bg-green-600';
                    case 'NoFollow': return 'bg-red-600';
                    case 'Sponsored': return 'bg-yellow-600';
                }

            case 'PriceCategory':
                switch (value as PriceCategory) {
                    case 'Paid': return 'bg-green-600';
                    case 'Free': return 'bg-blue-600';
                    case 'Exchange': return 'bg-yellow-600';
                }

            case 'WebsiteType':
                switch (value as WebsiteType) {
                    case 'Default': return 'bg-green-600';
                    case 'PR': return 'bg-blue-600';
                    case 'Language': return 'bg-yellow-600';
                    case 'PR_Brand': return 'bg-purple-600';
                    case 'PR_NonBrand': return 'bg-orange-600';
                }

            case 'WebsiteStatus':
                switch (value as WebsiteStatus) {
                    case 'Normal': return 'bg-green-600';
                    case 'Blacklist': return 'bg-red-600';
                    case 'Disqualified': return 'bg-yellow-600';
                }

            case 'WebsiteQuality':
                switch (value as WebsiteQuality) {
                    case 'Pure': return 'bg-green-600';
                    case 'AlmostPure': return 'bg-yellow-600';
                    case 'Multi': return 'bg-red-600';
                }

            case 'VendorCategory':
                switch (value as VendorCategory) {
                    case 'Individual': return 'bg-green-600';
                    case 'Agency': return 'bg-blue-600';
                }

            default:
                return 'bg-gray-600';
        }

        return 'bg-gray-600';
    }, []);
};

export interface EnumBadgeProps {
    enum: 'ClientPaymentStatus' | 'VendorPaymentStatus' | 'OrderStatus' | 'VendorInvoiceStatus' | 'SiteClassification' | 'linkAttribute' | 'PriceCategory' | 'WebsiteType' | 'WebsiteStatus' | 'WebsiteQuality' | 'VendorCategory';
    value: string;
}

export const getEnumValues = (enumType: string): string[] => {
    switch (enumType) {
        case 'ClientPaymentStatus':
            return ['Received', 'PartiallyReceived', 'Pending', 'NotReceived'];
        case 'VendorPaymentStatus':
            return ['Hold', 'Unpaid', 'Paid', 'PartiallyPaid', 'Cancel'];
        case 'OrderStatus':
            return ['Pending', 'Given', 'Publish', 'NotPublish', 'Cancel', 'Replacement', 'NeedUpdate', 'Order_Replaced'];
        case 'VendorInvoiceStatus':
            return ['Pending', 'Ask', 'Received', 'Given', 'Paid'];
        case 'SiteClassification':
            return ['Normal', 'Casino', 'Cbd', 'Adult', 'Organic', 'Crypto'];
        case 'linkAttribute':
            return ['DoFollow', 'NoFollow', 'Sponsored'];
        case 'PriceCategory':
            return ['Paid', 'Free', 'Exchange'];
        case 'WebsiteType':
            return ['Default', 'PR', 'Language', 'PR_Brand', 'PR_NonBrand'];
        case 'WebsiteStatus':
            return ['Normal', 'Blacklist', 'Disqualified'];
        case 'WebsiteQuality':
            return ['Pure', 'AlmostPure', 'Multi'];
        case 'VendorCategory':
            return ['Individual', 'Agency'];
        default:
            return [];
    }
}

function EnumBadge({ enum: enumType, value }: EnumBadgeProps) {
    const className = useStatusColor()({ enum: enumType, value });
    return (
        <div>
            <Badge className={className}>{value}</Badge>
        </div>
    )
}

export default EnumBadge;

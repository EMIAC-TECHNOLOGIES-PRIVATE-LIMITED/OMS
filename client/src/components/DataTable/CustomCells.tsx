
import { CustomCellRendererProps } from 'ag-grid-react';
import { Badge } from "@/components/ui/badge";
import { SiteCategory } from '@/types/adminTable';


/**
 * Custom cell renderer for site.category field
 * Displays category values as badges using the siteCategories mapping
 */
export function CategoryCellRenderer(props: CustomCellRendererProps) {


    const categories: SiteCategory[] = props.data?.['site.categories'] || [];
    const displayCategories = categories.slice(0, 2);
    const hasMore = categories.length > 2;

    return (
        <div className="flex flex-wrap gap-1 p-2">
            {displayCategories.map((category: SiteCategory) => (
                <Badge
                    key={category.id}
                    className="bg-brand/20 text-brand hover:bg-brand/30 border border-brand/30"
                >
                    {`${category.category}`}
                </Badge>
            ))}
            {hasMore && (
                <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300">
                    +{categories.length - 2} more
                </Badge>
            )}
        </div>
    );
}
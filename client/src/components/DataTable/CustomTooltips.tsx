import { CustomTooltipProps } from 'ag-grid-react';
import { Badge } from "@/components/ui/badge";
import { SiteCategory } from '@/types/adminTable';


export const CategoryTooltip = (props: CustomTooltipProps) => {
  if (!props.value || !Array.isArray(props.value)) {
    return null;
  }

  const categories: SiteCategory[] = props.value

  const handleClick = () => {
    if (props.hideTooltipCallback) {
      props.hideTooltipCallback();
    }
  };

  return (
    <div
      className="bg-white/95 backdrop-blur-sm shadow-lg border border-gray-100 p-3 rounded-lg max-w-md"
      onClick={handleClick}
    >
      <div className="font-medium text-sm mb-2 text-gray-700">All Categories:</div>
      <div className="flex flex-wrap gap-2">
        {categories.length > 0 ? (
          categories.map((category: SiteCategory) => (
            <Badge
              key={category.id}
              className="bg-brand/20 text-brand hover:bg-brand/30 border border-brand/30"
            >
              {category.category}
            </Badge>
          ))
        ) : (
          <span className="text-gray-500 text-sm">No categories assigned</span>
        )}
      </div>
    </div>
  );
};

export default CategoryTooltip;
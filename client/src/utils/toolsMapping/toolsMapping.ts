
export const toolsMapping = [
    { "_tools_1": "Duplicate Domain Lookup" },
    { "_tools_2": "Price Lookup" },
    { "_tools_3": "Vendor Lookup" },
    { "_tools_4": "URL Sanitizer" },
    { "_tools_5": "Category Links Fetcher" },
    { "_tools_6": "Add Non-Responsive Domains" },
    { "_tools_7": "Niche Domains" }
];

export function getTitleFromKey(key: string): string | null {
    const found = toolsMapping.find((item) => Object.keys(item)[0] === key);
    if (!found) return null;

    return Object.values(found)[0];

}
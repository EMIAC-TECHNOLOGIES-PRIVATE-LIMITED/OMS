import { useState } from "react";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Our custom components
import { SideBar } from "./SideBar";

// Tools
import DuplicateWebsiteChecker from "./components/DuplicateWebsiteChecker";
import PriceChecker from "./components/PriceChecker";
import VendorChecker from "./components/VendorChecker";

// Helpers
import { getTitleFromKey } from "../../../../utils/toolsMapping/toolsMapping";
import URLSanitizer from "./components/URLSanitizer";
import { Landing } from "./components/Landing/Landing";

export default function ToolsPage() {
    // Recoil value for user/auth data


    // activeToolKey will be something like "_tools_1" or null if nothing is selected
    const [activeToolKey, setActiveToolKey] = useState<string | null>(null);

    // If a tool is selected, we derive its display name for the breadcrumb
    const activeToolTitle = activeToolKey ? getTitleFromKey(activeToolKey) : null;

    return (
        <SidebarProvider>
            {/* The sidebar takes a callback so it can set activeToolKey */}
            <SideBar activeToolKey={activeToolKey} setActiveToolKey={setActiveToolKey} />

            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b">
                    <div className="flex items-center gap-2 px-3">
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="mr-2 h-4" />

                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Tools</BreadcrumbPage>
                                </BreadcrumbItem>
                                {activeToolTitle && (
                                    <>
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>{activeToolTitle}</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </>
                                )}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 ">
                    {/* If no tool selected, show a default placeholder */}
                    {!activeToolKey && (

                        <Landing
                            setActiveToolKey={(activeToolKey: string) => setActiveToolKey(activeToolKey)}
                        />

                    )}

                    {/* Render the correct component based on activeToolKey */}
                    {activeToolKey === "_tools_1" && <DuplicateWebsiteChecker />}
                    {activeToolKey === "_tools_2" && <PriceChecker />}
                    {activeToolKey === "_tools_3" && <VendorChecker />}
                    {activeToolKey === "_tools_4" && <URLSanitizer />}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

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

import { SideBar } from "./SideBar";
import DuplicateWebsiteChecker from "./components/DuplicateWebsiteChecker";
import PriceChecker from "./components/PriceChecker";
import VendorChecker from "./components/VendorChecker";
import URLSanitizer from "./components/URLSanitizer";
import { Landing } from "./components/Landing/Landing";
import { getTitleFromKey } from "../../../../utils/toolsMapping/toolsMapping";
import CategoryLinks from "./components/CategoryLinks";
import TrashDomains from "./components/TrashDomains";
import NicheDomains from "./components/NicheDomains";
import LiveMatrics from "./components/LiveMatrics";
import SitesAi from "./components/SitesAi";

export default function ToolsPage() {
    const [activeToolKey, setActiveToolKey] = useState<string | null>(null);
    const activeToolTitle = activeToolKey ? getTitleFromKey(activeToolKey) : null;

    return (
        <SidebarProvider>
            <SideBar activeToolKey={activeToolKey} setActiveToolKey={setActiveToolKey} />

            <SidebarInset>
                <div className="flex flex-col h-screen">
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

                    <main className="flex-1 overflow-hidden">
                        <div className="h-full ">
                            {!activeToolKey ? (
                                <div className="h-full overflow-auto">
                                    <Landing setActiveToolKey={setActiveToolKey} />
                                </div>
                            ) : (
                                <div className="h-full overflow-auto">
                                    {activeToolKey === "_tools_1" && <DuplicateWebsiteChecker />}
                                    {activeToolKey === "_tools_2" && <PriceChecker />}
                                    {activeToolKey === "_tools_3" && <VendorChecker />}
                                    {activeToolKey === "_tools_4" && <URLSanitizer />}
                                    {activeToolKey === "_tools_5" && <CategoryLinks />}
                                    {activeToolKey === "_tools_6" && <TrashDomains />}
                                    {activeToolKey === "_tools_7" && <NicheDomains />}
                                    {activeToolKey === "_tools_8" && <LiveMatrics />}
                                    {activeToolKey === "_tools_9" && <SitesAi />}
                                    
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
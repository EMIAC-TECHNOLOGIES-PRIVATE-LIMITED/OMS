import React, { useState, useEffect } from "react";
import { useLocation, Outlet, useNavigate, Link } from "react-router-dom";
import { AppSidebar } from "./components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Page() {
  const location = useLocation();
  const navigate = useNavigate();
  const [breadcrumbs, setBreadcrumbs] = useState<{ title: string, path: string, isLast: boolean }[]>([]);

  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);

    const breadcrumbItems = pathSegments.map((segment, index) => {
      const formattedTitle = segment
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/([a-z])([A-Z])/g, '$1 $2');

      const path = '/' + pathSegments.slice(0, index + 1).join('/');

      return {
        title: formattedTitle,
        path,
        isLast: index === pathSegments.length - 1
      };
    });

    setBreadcrumbs(breadcrumbItems);

    if (location.pathname === '/dashboard') {
      navigate('/dashboard/manageroles', { replace: true });
    }
  }, [location, navigate]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Link to="/dashboard">
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />

                {breadcrumbs.map((crumb) => (
                  <React.Fragment key={crumb.path}>
                    <BreadcrumbItem>
                      {crumb.isLast ? (
                        <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                      ) : (
                        <Link to={crumb.path}>
                          <BreadcrumbLink >{crumb.title}</BreadcrumbLink>
                        </Link>
                      )}
                    </BreadcrumbItem>
                    {!crumb.isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
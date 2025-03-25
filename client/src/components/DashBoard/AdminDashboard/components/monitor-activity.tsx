import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SystemPerformanceMonitor() {
  return (
    <div className="grid gap-4">
      <Card className="relative">
        {/* Overlay container */}
        <div className="absolute inset-0 backdrop-blur-sm bg-gray-400/10 z-10 flex items-center justify-center">
          <Card className="bg-white border-brand-dark shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-brand drop-shadow-md">
                  Hold Tight! Magic in Progress
                </h2>
                <p className="text-sm text-brand drop-shadow-md mt-1">
                  Picture wizards conjuring up something epic.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Original content with slight blur */}
        <div className="relative">
          <CardHeader>
            <CardTitle>System Performance Monitor</CardTitle>
            <CardDescription>View and analyze system performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
            
              {/* Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">33</div>
                    <p className="text-xs text-muted-foreground">+12% from last week</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">API Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-500">1,347</div>
                    <p className="text-xs text-muted-foreground">+4% from yesterday</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Errors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">12</div>
                    <p className="text-xs text-muted-foreground">-7% from yesterday</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Average Response Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-500">250ms</div>
                    <p className="text-xs text-muted-foreground">+3% from last hour</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Server Uptime</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">99.9%</div>
                    <p className="text-xs text-muted-foreground">Stable</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Database Queries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-500">2,456</div>
                    <p className="text-xs text-muted-foreground">+10% from yesterday</p>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Chart Placeholder with SVG */}
              <div className="h-[300px] rounded-md bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center text-brand">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <polyline
                      points="0,100 20,60 40,70 60,50 80,60 100,20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
    
                </div>
              </div>

              {/* System Health and Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* System Health Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Card className="p-4">
                      <p className="text-sm font-medium">CPU Usage</p>
                      <div className="h-2 bg-muted rounded mt-1">
                        <div
                          className="h-2 bg-green-500 rounded"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">60% Usage</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-sm font-medium">Memory Usage</p>
                      <div className="h-2 bg-muted rounded mt-1">
                        <div
                          className="h-2 bg-red-500 rounded"
                          style={{ width: "80%" }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">80% Usage</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-sm font-medium">Disk Usage</p>
                      <div className="h-2 bg-muted rounded mt-1">
                        <div
                          className="h-2 bg-green-500 rounded"
                          style={{ width: "40%" }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">40% Usage</p>
                    </Card>
                  </CardContent>
                </Card>

                {/* Recent Activity Card */}
                <Card className="bg-slate-400/10">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="bg-muted p-2 rounded text-sm">
                        User login: John Doe at 14:35
                      </li>
                      <li className="bg-muted p-2 rounded text-sm">
                        API request: GET /users at 14:36
                      </li>
                      <li className="bg-muted p-2 rounded text-sm">
                        Error: Database connection failed at 14:37
                      </li>
                      <li className="bg-muted p-2 rounded text-sm">
                        System alert: High CPU usage at 14:38
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
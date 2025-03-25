import { Card, CardContent } from "@/components/ui/card";

function MonitorUsers() {
    return (
        <>
            <div className="grid gap-4">
                <Card className="relative">
                    {/* Overlay container */}
                    <div className="absolute inset-0 backdrop-blur-sm bg-gray-400/10 z-10 flex items-center justify-center">
                        <Card className="bg-white border-brand-dark shadow-lg">
                            <CardContent className="p-4">
                                <div className="text-center">
                                    <h2 className="text-2xl font-semibold text-brand drop-shadow-md">
                                        We don't (currently) do that here.
                                    </h2>
                                    <p className="text-sm text-black drop-shadow-md mt-1">
                                        This section is accessable at <a target="blank" className={'underline italic text-blue-700'} href="https://stats.oms.emiactech.com/d/deezsbonudzpca/activity?orgId=1&from=now-1h&to=now&timezone=browser&var-selected_user=$__all&var-selected_resource=site&var-selected_action=update&var-selected_status=$__all&refresh=5s">stats.oms.emiactech.com</a> with the root credentials.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-center items-center h-full">
                        <img src="/grafana.png" alt="" />
                    </div>
                </Card>
            </div>
        </>
    );
}

export default MonitorUsers;
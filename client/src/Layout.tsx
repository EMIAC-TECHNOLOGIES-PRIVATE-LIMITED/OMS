import { Outlet } from 'react-router-dom';
import LoggedInHeader from './components/Header/LoggedInHeader';
import { useRecoilValue } from 'recoil';
import { authAtom } from "./store/atoms/atoms";
import { Toaster } from './components/ui/toaster';
import JellyLoader from './components/UI/GlobalLoader/GlobalLoader';
import { useEffect, useState } from 'react';
import Offline from './pages/publicPages/Offline';


function Layout() {
    const { isAuthenticated, loading } = useRecoilValue(authAtom);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        // Event listeners for online/offline status
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        // Add event listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Clean up event listeners
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <JellyLoader size={100} color="#007b3c" speed={1.2} />
            </div>
        );
    }

    return (
        <>
            {isAuthenticated ? <LoggedInHeader /> : <> </>}

            {isOnline ? <Outlet /> : <Offline />}

            <Toaster />
        </>
    );
}

export default Layout;
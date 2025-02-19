
import { Outlet } from 'react-router-dom';
import LoggedInHeader from './components/Header/LoggedInHeader';
import { useRecoilValue } from 'recoil';
import { authAtom } from "./store/atoms/atoms";
import { Toaster } from './components/ui/toaster';
import JellyLoader from './components/UI/GlobalLoader/GlobalLoader';

function Layout() {
    const { isAuthenticated, loading } = useRecoilValue(authAtom);




    if (loading) {
        return (<div className="flex justify-center items-center h-screen">
            <JellyLoader size={100}
                color="#007b3c"
                speed={1.2} />
        </div>);
    }

    return (
        <>
            {isAuthenticated ? <LoggedInHeader /> : <> </>}
            <Outlet />
            <Toaster />
        </>
    );
}

export default Layout;

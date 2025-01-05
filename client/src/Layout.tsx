import Footer from './components/Footer/Footer';
import { Outlet } from 'react-router-dom';
import LoggedInHeader from './components/Header/LoggedInHeader';
import LoggedOutHeader from './components/Header/LoggedOutHeader';
import { useRecoilValue } from 'recoil';
import { authAtom } from "./store/atoms/atoms";

function Layout() {
    const { isAuthenticated, loading } = useRecoilValue(authAtom);

    
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {isAuthenticated ? <LoggedInHeader /> : <LoggedOutHeader />}
            <Outlet />
            <Footer />
        </>
    );
}

export default Layout;

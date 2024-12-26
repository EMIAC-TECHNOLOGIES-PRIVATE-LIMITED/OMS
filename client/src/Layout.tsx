import Footer from './components/Footer/Footer';
import { Outlet } from 'react-router-dom';
import LoggedInHeader from './components/Header/LoggedInHeader';
import LoggedOutHeader from './components/Header/LoggedOutHeader';
import Cookies from 'js-cookie';

function Layout() {

    const initialAuthFlag = Cookies.get('isAuthenticated') === 'true';

    return (
        <>
            {initialAuthFlag ? <LoggedInHeader /> : <LoggedOutHeader />}
            <Outlet />
            <Footer />
        </>
    );
}

export default Layout;

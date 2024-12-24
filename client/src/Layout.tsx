import { useRecoilValue } from 'recoil';
import { authAtom } from './store/atoms/atoms';
import Footer from './components/Footer/Footer'
import { Outlet } from 'react-router-dom'
import LoggedInHeader from './components/Header/LoggedInHeader';
import LoggedOutHeader from './components/Header/LoggedOutHeader';

function Layout() {


  const { isAuthenticated } = useRecoilValue(authAtom);

  return (
    <>
      {isAuthenticated ? <LoggedInHeader /> : <LoggedOutHeader />}
      <Outlet />
      <Footer />
    </>
  )
}

export default Layout
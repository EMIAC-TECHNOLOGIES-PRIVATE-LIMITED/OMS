import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import { Outlet } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material'
function Layout() {
  const theme = createTheme({
    colorSchemes: {
      dark: true,
      light: true,
    }
  })
  return (
    <>
      <ThemeProvider theme={theme}>

        <Header />
        <Outlet />
        <Footer />

      </ThemeProvider>
    </>
  )
}

export default Layout
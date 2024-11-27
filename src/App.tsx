import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './assets/css/App.scss';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import { ChakraProvider } from '@chakra-ui/react';
import initialTheme from './theme/theme'; //  { themeGreen }
import { useState } from 'react';
import PrivateRoute from "./routes/PrivateRoute";
import useAuth from "./hooks/useAuth";
// Chakra imports

const Main = () => {
    // eslint-disable-next-line
    const [currentTheme, setCurrentTheme] = useState(initialTheme)
    const { isAuthenticated } = useAuth()

    return (
        <ChakraProvider theme={currentTheme}>
            <Routes>
                {/*Public routes*/}
                {
                    !isAuthenticated && (
                        <>
                            <Route path={'/'} element={<AuthLayout/>}/>
                            <Route path="auth/*" element={<AuthLayout/>}/>
                        </>
                    )
                }
                {/*Private routes*/}
                <Route element={<PrivateRoute/>}>
                    <Route path="/" element={<Navigate to="/admin" replace/>}/>
                    <Route
                        path="admin/*"
                        element={
                            <AdminLayout theme={currentTheme} setTheme={setCurrentTheme}/>
                        }
                    />
                </Route>
            </Routes>
        </ChakraProvider>
    );
}
export default Main;
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './assets/css/App.css';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import { ChakraProvider } from '@chakra-ui/react';
import initialTheme from './theme/theme'; //  { themeGreen }
import { useEffect, useState } from 'react';
import PrivateRoute from "./routes/PrivateRoute";
import { useAuth } from "./hooks";
// Chakra imports

const Main = () => {
    // eslint-disable-next-line
    const [currentTheme, setCurrentTheme] = useState(initialTheme)
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate();
    const location = useLocation(); // Lấy thông tin về URL hiện tại

    useEffect(() => {
        if (isAuthenticated) {
            // Kiểm tra nếu pathname là "/" hoặc rỗng
            if (location.pathname === '/' || location.pathname.trim() === '') {
                navigate('/admin/chat', { replace: true });
            }
        } else {
            navigate('/auth/sign-in', { replace: true });
        }
    }, [navigate, isAuthenticated, location.pathname]);

    return (
        <ChakraProvider theme={currentTheme}>
            <Routes>
                {/*Public routes*/}
                <Route path={'/'} element={<AuthLayout/>}/>
                <Route path="auth/*" element={<AuthLayout/>}/>
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
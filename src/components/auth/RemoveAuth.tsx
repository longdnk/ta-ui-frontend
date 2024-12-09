import { useAuth } from "../../hooks";
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";

const RemoveAuth = () => {

    const { isAuthenticated, clearToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            clearToken()
        }
    }, [isAuthenticated, clearToken]);

    useEffect(() => {
        isAuthenticated ? navigate('/admin/chat') : navigate('/auth/sign-in');
    }, [isAuthenticated, navigate]);

    return (
        <>
        </>
    )
}

export default RemoveAuth;
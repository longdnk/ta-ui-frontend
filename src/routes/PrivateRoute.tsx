import React from 'react';
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from "../hooks";

const PrivateRoute = () => {
    const { isAuthenticated } = useAuth()
    return isAuthenticated ? <Outlet/> : <Navigate to={'/auth/sign-in'} />
}

export default PrivateRoute
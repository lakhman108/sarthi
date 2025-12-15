import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { publicRoutes } from './public';
import { protectedRoutes } from './protected';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            {publicRoutes.map((route, index) => (
                <Route key={`public-${index}`} path={route.path} element={route.element} />
            ))}

            {/* Protected Routes */}
            {protectedRoutes.map((route, index) => (
                <Route key={`protected-${index}`} path={route.path} element={route.element} />
            ))}

            {/* 404 Route */}
            <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
    );
};

export default AppRoutes;

import { lazy } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';

const Roles = lazy(() => import('../pages/usermanagement/Roles'));
const Users = lazy(() => import('../pages/usermanagement/Users'));
const Permissions = lazy(() => import('../pages/usermanagement/Permissions'));
const RegisterCover = lazy(() => import('../pages/auth/RegisterCover'));
const LoginCover = lazy(() => import('../pages/auth/LoginCover'));
const RecoverIdCover = lazy(() => import('../pages/auth/RecoverIdCover'));
const Index = lazy(() => import('../pages/Index'));
const Error404 = lazy(() => import('../pages/Error404'));

const routes = [
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <Index />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/permissions',
        element: (
            <ProtectedRoute>
                <Permissions />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/roles',
        element: (
            <ProtectedRoute>
                <Roles />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/users',
        element: (
            <ProtectedRoute>
                <Users />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/login',
        element: <LoginCover />,
        layout: 'blank',
    },
    {
        path: '/signup',
        element: <RegisterCover />,
        layout: 'blank',
    },
    {
        path: '/recover-password',
        element: <RecoverIdCover />,
        layout: 'blank',
    },
    {
        path: '*',
        element: <Error404 />,
        layout: 'default',
    },
];

export { routes };

import { lazy } from 'react';

const Roles = lazy(() => import('../pages/usermanagement/Roles'));
const Users = lazy(() => import('../pages/usermanagement/Users'));
const Permissions = lazy(() => import('../pages/usermanagement/Permissions'));
const RegisterCover = lazy(() => import('../pages/auth/RegisterCover'));
const LoginCover = lazy(() => import('../pages/auth/LoginCover'));
const RecoverIdCover = lazy(() => import('../pages/auth/RecoverIdCover'));
const Index = lazy(() => import('../pages/Index'));
const Error404 = lazy(() => import('../pages/Error404'));

const routes = [
    // Base Path
    {
        path: '/',
        element: <Index />,
        layout: 'default',
    },

    // Auth
    {
        path: '/singup',
        element: <RegisterCover />,
        layout: 'blank',
    },
    {
        path: '/login',
        element: <LoginCover />,
        layout: 'blank',
    },
    {
        path: '/recover-password',
        element: <RecoverIdCover />,
        layout: 'blank',
    },

    // dashboard

    // User Managment
    {
        path: '/permissions',
        element: <Permissions />,
        layout: 'default',
    },
    {
        path: '/roles',
        element: <Roles />,
        layout: 'default',
    },
    {
        path: '/users',
        element: <Users />,
        layout: 'default',
    },

    // catch all route(404)
    {
        path: '*',
        element: <Error404 />, // Render the 404 component
        layout: 'default', // Specify the layout if required
    },
];

export { routes };

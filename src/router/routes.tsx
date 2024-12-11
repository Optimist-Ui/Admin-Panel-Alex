import { lazy } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Properties from '../pages/properties/Properties';
import AddProperties from '../pages/properties/AddProperties';
import Subscription from '../pages/Subscription/Subscription';
import Profile from '../pages/profile/Profile';
import EditProperty from '../pages/properties/EditProperty';
import Countries from '../pages/countries/Countries';
import UpdateCountry from '../pages/countries/UpdateCountry';
import CountryCities from '../pages/countries/cities/CountryCities';
import UpdateCity from '../pages/countries/cities/UpdateCity';

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
        path: '/countries',
        element: (
            <ProtectedRoute>
                <Countries />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/cities',
        element: (
            <ProtectedRoute>
                <CountryCities />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/city/update/:id',
        element: (
            <ProtectedRoute>
                <UpdateCity />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/countries/update/:id',
        element: (
            <ProtectedRoute>
                <UpdateCountry />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/properties',
        element: (
            <ProtectedRoute>
                <Properties />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/properties/add',
        element: (
            <ProtectedRoute>
                <AddProperties />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/properties/update/:propertyId',
        element: (
            <ProtectedRoute>
                <EditProperty />
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
        path: '/plans',
        element: (
            <ProtectedRoute>
                <Subscription />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/profile',
        element: (
            <ProtectedRoute>
                <Profile />
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
        layout: 'blank',
    },
];

export { routes };

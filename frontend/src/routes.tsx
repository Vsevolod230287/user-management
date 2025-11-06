import type {RouteObject} from 'react-router-dom';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { PrivateRoute } from './components/PrivateRoute';
import {LoginForm} from "./components/LoginForm.tsx";
import {RegisterForm} from "./components/RegisterForm.tsx";
import {ProfilePage} from "./components/ProfilePage.tsx";
import AdminPanel from "./components/AdminPanel.tsx";
import {HomePage} from "./pages/HomePage.tsx";

export const appRoutes: RouteObject[] = [
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/login',
        element: <LoginForm />,
    },
    {
        path: '/register',
        element: <RegisterForm />,
    },
    {
        path: '/unauthorized',
        element: <UnauthorizedPage />,
    },
    {
        path: '/profile',
        element: (
            <PrivateRoute roles={['user', 'admin']}>
                <ProfilePage />
            </PrivateRoute>
        ),
    },
    {
        path: '/profile/:id',
        element: (
            <PrivateRoute roles={['user', 'admin']}>
                <ProfilePage />
            </PrivateRoute>
        ),
    },
    {
        path: '/users',
        element: (
            <PrivateRoute roles={['admin']}>
                <AdminPanel />
            </PrivateRoute>
        ),
    },
    // ... altre route
];
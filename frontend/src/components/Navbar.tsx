import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Switch,
    Box,
    Chip
} from '@mui/material';
import {
    LightMode,
    DarkMode,
    AdminPanelSettings,
    Person
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
    themeMode: 'light' | 'dark';
    setThemeMode: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
}

export const Navbar: React.FC<NavbarProps> = ({ themeMode, setThemeMode }) => {
    const { user, logout, isAuthenticated, hasRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const toggleTheme = () => {
        setThemeMode(themeMode === 'light' ? 'dark' : 'light');
    };

    // Nascondi la navbar nelle pagine di login/register se non autenticato
    if (!isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
        return null;
    }

    const isAdmin = hasRole('admin');

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography
                    variant="h6"
                    sx={{
                        flexGrow: 1,
                        cursor: 'pointer'
                    }}
                    onClick={() => navigate('/')}
                >
                    User Management App
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Toggle Theme */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {themeMode === 'dark' ? (
                            <DarkMode sx={{ color: 'white', fontSize: '1.2rem' }} />
                        ) : (
                            <LightMode sx={{ color: 'white', fontSize: '1.2rem' }} />
                        )}
                        <Switch
                            checked={themeMode === 'dark'}
                            onChange={toggleTheme}
                            color="default"
                        />
                    </Box>

                    {!isAuthenticated ? (
                        // Utente non autenticato
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                color="inherit"
                                onClick={() => navigate('/login')}
                                variant="outlined"
                                size="small"
                            >
                                Login
                            </Button>
                            <Button
                                color="inherit"
                                onClick={() => navigate('/register')}
                                variant="outlined"
                                size="small"
                            >
                                Register
                            </Button>
                        </Box>
                    ) : (
                        // Utente autenticato
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {/* Navigazione */}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    color="inherit"
                                    onClick={() => navigate('/profile')}
                                    variant="text"
                                    size="small"
                                >
                                    My Profile
                                </Button>
                                {isAdmin && (
                                    <Button
                                        color="inherit"
                                        onClick={() => navigate('/users')}
                                        variant="text"
                                        size="small"
                                    >
                                        Manage Users
                                    </Button>
                                )}
                            </Box>

                            {/* Info utente */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                borderLeft: '1px solid rgba(255,255,255,0.3)',
                                borderRight: '1px solid rgba(255,255,255,0.3)',
                                px: 2
                            }}>
                                {isAdmin ? (
                                    <AdminPanelSettings sx={{ fontSize: '1.2rem' }} />
                                ) : (
                                    <Person sx={{ fontSize: '1.2rem' }} />
                                )}

                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        {user?.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {user?.roles.map((role, index) => (
                                            <Chip
                                                key={index}
                                                label={role.name}
                                                size="small"
                                                variant="filled"
                                                color={role.name === 'admin' ? 'secondary' : 'primary'}
                                                sx={{
                                                    height: '20px',
                                                    fontSize: '0.6rem',
                                                    '& .MuiChip-label': { px: 1 }
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Logout */}
                            <Button
                                color="inherit"
                                onClick={handleLogout}
                                variant="outlined"
                                size="small"
                                sx={{
                                    borderColor: 'rgba(255,255,255,0.5)',
                                    '&:hover': {
                                        borderColor: 'white',
                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                    }
                                }}
                            >
                                Logout
                            </Button>
                        </Box>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};
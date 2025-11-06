import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { appRoutes } from './routes';
import { Navbar } from './components/Navbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useState, useMemo } from 'react';

function AppRoutes() {
    return useRoutes(appRoutes);
}

function App() {
    const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');

    const theme = useMemo(() => createTheme({
        palette: {
            mode: themeMode,
            primary: {
                main: '#1976d2',
                light: '#42a5f5',
                dark: '#1565c0',
            },
            secondary: {
                main: '#dc004e',
                light: '#ff5983',
                dark: '#9a0036',
            },
            background: {
                default: themeMode === 'light' ? '#f5f5f5' : '#121212',
                paper: themeMode === 'light' ? '#ffffff' : '#1e1e1e',
            },
            text: {
                primary: themeMode === 'light' ? '#1a1a1a' : '#ffffff',
                secondary: themeMode === 'light' ? '#666666' : '#b0b0b0',
            },
            divider: themeMode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
        },
        typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            h1: {
                fontWeight: 600,
            },
            h2: {
                fontWeight: 600,
            },
            h3: {
                fontWeight: 600,
            },
            h4: {
                fontWeight: 600,
            },
            h5: {
                fontWeight: 600,
            },
            h6: {
                fontWeight: 600,
            },
        },
        shape: {
            borderRadius: 8,
        },
        components: {
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: themeMode === 'light' ? '#1976d2' : '#0d47a1',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        boxShadow: themeMode === 'light'
                            ? '0 2px 8px rgba(0,0,0,0.1)'
                            : '0 2px 8px rgba(0,0,0,0.3)',
                    },
                },
            },
            MuiTableRow: {
                styleOverrides: {
                    root: {
                        '&:last-child td, &:last-child th': {
                            border: 0,
                        },
                    },
                },
            },
        },
    }), [themeMode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Navbar themeMode={themeMode} setThemeMode={setThemeMode} />
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
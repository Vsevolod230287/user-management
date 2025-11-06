// src/pages/HomePage.tsx
import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, hasRole } = useAuth();

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Paper
                elevation={3}
                sx={{
                    p: 6,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}
            >
                <Typography variant="h2" gutterBottom>
                    Benvenuto
                </Typography>
                <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                    User Management System
                </Typography>

                {isAuthenticated && user ? (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Ciao, {user.name}!
                        </Typography>
                        <Typography variant="body1" gutterBottom sx={{ mb: 4 }}>
                            Ruoli: {user.roles.map(role => role.name).join(', ')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/profile')}
                                sx={{
                                    backgroundColor: 'white',
                                    color: '#667eea',
                                    '&:hover': {
                                        backgroundColor: '#f5f5f5'
                                    }
                                }}
                            >
                                Il Mio Profilo
                            </Button>

                            {hasRole('admin') && (
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => navigate('/users')}
                                    sx={{
                                        borderColor: 'white',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.1)'
                                        }
                                    }}
                                >
                                    Gestione Utenti
                                </Button>
                            )}
                        </Box>
                    </Box>
                ) : (
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
                            Accedi o registrati per iniziare
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/login')}
                                sx={{
                                    backgroundColor: 'white',
                                    color: '#667eea',
                                    '&:hover': {
                                        backgroundColor: '#f5f5f5'
                                    }
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/register')}
                                sx={{
                                    borderColor: 'white',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                    }
                                }}
                            >
                                Registrati
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>

            {/* Sezioni informative */}
            <Box sx={{ mt: 6, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 4 }}>
                <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        👤 Gestione Profilo
                    </Typography>
                    <Typography variant="body2">
                        Modifica le tue informazioni personali, email e visualizza i tuoi permessi.
                    </Typography>
                </Paper>

                <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        🛡️ Sistema di Ruoli
                    </Typography>
                    <Typography variant="body2">
                        Sistema di autorizzazione avanzato con ruoli e permessi specifici.
                    </Typography>
                </Paper>

                <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        🔐 Sicurezza
                    </Typography>
                    <Typography variant="body2">
                        Autenticazione protetta e gestione sicura degli accessi.
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
};
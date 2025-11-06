// src/pages/UnauthorizedPage.tsx
import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const UnauthorizedPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom color="error">
                Accesso Negato
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
                Non hai i permessi necessari per accedere a questa pagina.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    onClick={() => navigate(-1)}
                >
                    Torna Indietro
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                >
                    Vai alla Home
                </Button>
            </Box>
        </Container>
    );
};
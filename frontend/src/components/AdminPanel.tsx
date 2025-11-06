// src/pages/AdminPanel.tsx
import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow,
    CircularProgress, Typography, Snackbar, Alert,
    Container, Paper, Box, IconButton, Menu, MenuItem
} from '@mui/material';
import {
    Edit as EditIcon,
    AdminPanelSettings as AdminIcon,
    Person as UserIcon,
    MoreVert as MoreIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../api/api.ts';
import { useAuth } from '../context/AuthContext'; // Importa useAuth
import type { User } from '../types/auth';

const AdminPanel: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [snackbar, setSnackbar] = useState<{ message: string, severity: 'success' | 'error' } | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement, userId: number } | null>(null);
    const navigate = useNavigate();
    const { user: currentUser, refreshUser } = useAuth(); // Ottieni currentUser e refreshUser

    useEffect(() => {
        void fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get<User[]>('/users');
            setUsers(response.data);
        } catch (err) {
            console.error(err);
            setSnackbar({ message: 'Errore nel recuperare gli utenti', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const toggleAdminRole = async (userId: number, currentRole: 'admin' | 'user') => {
        setActionLoading(userId);
        setMenuAnchor(null);

        try {
            const newRole = currentRole === 'admin' ? 'user' : 'admin';
            await api.post(`/users/${userId}/assign-role`, { role: newRole });

            setSnackbar({
                message: currentRole === 'admin'
                    ? 'Utente retrocesso a user'
                    : 'Utente promosso a admin',
                severity: 'success'
            });

            // Ricarica la lista utenti
            void fetchUsers();

            // Se stai cambiando il ruolo dell'utente corrente, aggiorna l'AuthContext
            if (currentUser && userId === currentUser.id) {
                await refreshUser();
            }

        } catch (err: any) {
            console.error(err);
            setSnackbar({ message: err.response?.data?.message || 'Errore nel cambiare il ruolo', severity: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleEditUser = (userId: number) => {
        navigate(`/profile/${userId}`);
    };

    const isUserAdmin = (user: User) => {
        return user.roles.some(r => r.name === 'admin');
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: number) => {
        setMenuAnchor({ element: event.currentTarget, userId });
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const getCurrentRole = (user: User): 'admin' | 'user' => {
        return isUserAdmin(user) ? 'admin' : 'user';
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
                Gestione Utenti
            </Typography>

            <Paper
                elevation={3}
                sx={{
                    width: '100%',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
            >
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ) : (
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                                    ID
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                                    Nome
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                                    Email
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                                    Email Verificata
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                                    Ruoli
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', textAlign: 'center' }}>
                                    Azioni
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map(user => (
                                <TableRow
                                    key={user.id}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                            transition: 'background-color 0.2s'
                                        }
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 'medium' }}>
                                        {user.id}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'medium' }}>
                                        {user.name}
                                    </TableCell>
                                    <TableCell>
                                        {user.email}
                                    </TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: 'inline-block',
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                backgroundColor: user.email_verified_at ? 'success.light' : 'grey.300',
                                                color: user.email_verified_at ? 'success.contrastText' : 'grey.700',
                                                fontSize: '0.875rem',
                                                fontWeight: 'medium',
                                            }}
                                        >
                                            {user.email_verified_at ? 'Verificata' : 'Non verificata'}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            {user.roles.length > 0 ? (
                                                user.roles.map((role, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            display: 'inline-block',
                                                            padding: '4px 8px',
                                                            borderRadius: '8px',
                                                            backgroundColor: role.name === 'admin' ? 'secondary.main' : 'primary.light',
                                                            color: 'white',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {role.name}
                                                    </Box>
                                                ))
                                            ) : (
                                                <Box
                                                    sx={{
                                                        display: 'inline-block',
                                                        padding: '4px 8px',
                                                        borderRadius: '8px',
                                                        backgroundColor: 'grey.300',
                                                        color: 'grey.700',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    user
                                                </Box>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleEditUser(user.id)}
                                                sx={{
                                                    backgroundColor: 'primary.light',
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: 'primary.main',
                                                    }
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>

                                            <IconButton
                                                onClick={(e) => handleMenuOpen(e, user.id)}
                                                disabled={actionLoading === user.id}
                                                sx={{
                                                    backgroundColor: 'grey.300',
                                                    '&:hover': {
                                                        backgroundColor: 'grey.400',
                                                    }
                                                }}
                                            >
                                                {actionLoading === user.id ? (
                                                    <CircularProgress size={20} />
                                                ) : (
                                                    <MoreIcon />
                                                )}
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Paper>

            {/* Menu per cambiare ruolo */}
            <Menu
                anchorEl={menuAnchor?.element}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                {menuAnchor && (() => {
                    const user = users.find(u => u.id === menuAnchor.userId);
                    if (!user) return null;

                    const currentRole = getCurrentRole(user);
                    const isAdmin = currentRole === 'admin';

                    return (
                        <MenuItem
                            onClick={() => toggleAdminRole(user.id, currentRole)}
                            disabled={actionLoading === user.id}
                        >
                            {isAdmin ? (
                                <>
                                    <UserIcon sx={{ mr: 1 }} />
                                    Retrocedi a User
                                </>
                            ) : (
                                <>
                                    <AdminIcon sx={{ mr: 1 }} />
                                    Promuovi a Admin
                                </>
                            )}
                        </MenuItem>
                    );
                })()}
            </Menu>

            <Snackbar
                open={!!snackbar}
                autoHideDuration={4000}
                onClose={() => setSnackbar(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                {snackbar ? (
                    <Alert
                        severity={snackbar.severity}
                        onClose={() => setSnackbar(null)}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                ) : undefined}
            </Snackbar>
        </Container>
    );
};

export default AdminPanel;
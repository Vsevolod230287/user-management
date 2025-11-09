// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Container,
    Fade,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/auth';

export const ProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user: currentUser, hasRole, refreshUser, logout } = useAuth();
    const navigate = useNavigate();

    const [userDetail, setUserDetail] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);

    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');

    // Determina se stiamo visualizzando il profilo personale o di un altro utente
    const isOwnProfile = !id || id === currentUser?.id.toString();
    const userId = id ? parseInt(id) : currentUser?.id;

    // Controlla i permessi per modificare
    const canEditUser = isOwnProfile || hasRole('admin');

    // Controlla i permessi per eliminare
    const canDeleteUser = () => {
        if (!userDetail || !currentUser) return false;

        // L'admin può eliminare qualsiasi utente tranne se stesso
        if (hasRole('admin')) {
            return userDetail.id !== currentUser.id;
        }

        // L'utente normale può eliminare solo se stesso
        return userDetail.id === currentUser.id;
    };

    // Effetto per far scomparire il messaggio di successo dopo 3.5 secondi
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess('');
            }, 3500);

            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;

            try {
                const response = await api.get<User>(`/users/${userId}`);
                setUserDetail(response.data);
                setEditName(response.data.name);
                setEditEmail(response.data.email);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch user');
            } finally {
                setLoading(false);
            }
        };

        void fetchUser();
    }, [userId]);

    const handleSave = async () => {
        if (!userDetail) return;
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const response = await api.put<User>(`/users/${userDetail.id}`, {
                name: editName,
                email: editEmail,
            });
            setUserDetail(response.data);
            setSuccess('Profilo aggiornato con successo!');

            // Se stai modificando il profilo corrente, aggiorna l'AuthContext
            if (isOwnProfile) {
                await refreshUser();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleDeleteAccount = async () => {
        if (!userDetail) return;

        setDeleting(true);
        setError('');
        try {
            await api.delete(`/users/${userDetail.id}`);

            // Se l'utente sta eliminando il proprio account
            if (isOwnProfile) {
                setSuccess('Account eliminato con successo. Stai per essere disconnesso...');
                // Aspetta un momento per mostrare il messaggio di successo
                setTimeout(async () => {
                    await logout();
                    navigate('/login');
                }, 1500);
            } else {
                // Se un admin sta eliminando un altro utente
                setSuccess('Utente eliminato con successo');
                setDeleteDialog(false);
                setTimeout(() => {
                    navigate('/users'); // Torna alla lista utenti
                }, 1500);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Errore nell\'eliminare l\'account');
            setDeleting(false);
        }
    };

    const handleDeleteClick = () => {
        setError('');
        setDeleteDialog(true);
    };

    const handleDeleteCancel = () => {
        setDeleteDialog(false);
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
                {isOwnProfile ? 'My Profile' : `User Profile: ${userDetail?.name}`}
            </Typography>

            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    {error}
                </Alert>
            )}

            {/* Alert di successo centrato con animazione */}
            <Fade in={!!success} timeout={500}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2
                }}>
                    <Alert
                        severity="success"
                        sx={{
                            width: 'fit-content',
                            minWidth: 300,
                            textAlign: 'center'
                        }}
                    >
                        {success}
                    </Alert>
                </Box>
            </Fade>

            {userDetail && (
                <>
                    <Box display="flex" justifyContent="center">
                        <TableContainer
                            component={Paper}
                            sx={{
                                maxWidth: 800,
                                width: '100%',
                                boxShadow: 3,
                            }}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', width: '30%' }}>
                                            Field
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', width: '70%' }}>
                                            Value
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'medium' }}>ID</TableCell>
                                        <TableCell sx={{ fontSize: '1rem' }}>
                                            {userDetail.id}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'medium' }}>Name</TableCell>
                                        <TableCell>
                                            <TextField
                                                fullWidth
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                variant="outlined"
                                                size="small"
                                                disabled={!canEditUser}
                                            />
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'medium' }}>Email</TableCell>
                                        <TableCell>
                                            <TextField
                                                fullWidth
                                                type="email"
                                                value={editEmail}
                                                onChange={(e) => setEditEmail(e.target.value)}
                                                variant="outlined"
                                                size="small"
                                                disabled={!canEditUser}
                                            />
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'medium' }}>Email Verified</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={userDetail.email_verified_at ? 'Yes' : 'No'}
                                                color={userDetail.email_verified_at ? 'success' : 'default'}
                                                size="medium"
                                            />
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'medium' }}>Roles</TableCell>
                                        <TableCell sx={{ fontSize: '1rem' }}>
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {userDetail.roles.map((role, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={role.name}
                                                        color={role.name === 'admin' ? 'secondary' : 'primary'}
                                                        size="small"
                                                        variant="filled"
                                                    />
                                                ))}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'medium' }}>Permissions</TableCell>
                                        <TableCell sx={{ fontSize: '1rem' }}>
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {userDetail.permissions.map((permission, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={permission}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'medium' }}>Created At</TableCell>
                                        <TableCell sx={{ fontSize: '1rem' }}>
                                            {new Date(userDetail.created_at).toLocaleDateString('it-IT', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'medium' }}>Last Updated</TableCell>
                                        <TableCell sx={{ fontSize: '1rem' }}>
                                            {new Date(userDetail.updated_at).toLocaleDateString('it-IT', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 3, gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleBack}
                                    size="large"
                                >
                                    Back
                                </Button>

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    {/* Pulsante Delete spostato qui */}
                                    {canDeleteUser() && (
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={handleDeleteClick}
                                            disabled={deleting}
                                            size="large"
                                        >
                                            Delete
                                        </Button>
                                    )}

                                    {canEditUser && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleSave}
                                            disabled={saving}
                                            size="large"
                                            sx={{ minWidth: 120 }}
                                        >
                                            {saving ? <CircularProgress size={24} color="inherit" /> : 'Save'}
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </TableContainer>
                    </Box>


                </>
            )}

            {/* Dialog di conferma eliminazione */}
            <Dialog
                open={deleteDialog}
                onClose={handleDeleteCancel}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DeleteIcon color="error" />
                        Conferma Eliminazione
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {isOwnProfile
                            ? 'Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile e perderai tutti i tuoi dati.'
                            : `Sei sicuro di voler eliminare l'utente "${userDetail?.name}"? Questa azione è irreversibile.`
                        }
                    </Typography>
                    {isOwnProfile && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            Verrai disconnesso automaticamente dopo l'eliminazione.
                        </Alert>
                    )}
                    {hasRole('admin') && !isOwnProfile && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Stai eliminando l'account di un altro utente come amministratore.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ gap: 2, justifyContent: 'flex-end', px: 3, py: 2 }}>
                    <Button
                        onClick={handleDeleteCancel}
                        disabled={deleting}
                        variant="outlined"
                    >
                        Annulla
                    </Button>
                    <Button
                        onClick={handleDeleteAccount}
                        color="error"
                        variant="contained"
                        disabled={deleting}
                        startIcon={deleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                    >
                        {deleting ? 'Eliminazione...' : 'Elimina'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};
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
    Fade
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/auth';

export const ProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user: currentUser, hasRole, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [userDetail, setUserDetail] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');

    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');

    // Determina se stiamo visualizzando il profilo personale o di un altro utente
    const isOwnProfile = !id || id === currentUser?.id.toString();
    const userId = id ? parseInt(id) : currentUser?.id;

    // Controlla i permessi per modificare
    const canEditUser = isOwnProfile || hasRole('admin');

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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 3 }}>
                            <Button
                                variant="outlined"
                                onClick={handleBack}
                                size="large"
                            >
                                Back
                            </Button>
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
                    </TableContainer>
                </Box>
            )}
        </Container>
    );
};
// src/pages/AdminPanel.tsx
import React, {useEffect, useState} from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow,
    CircularProgress, Typography, Snackbar, Alert,
    Container, Paper, Box, IconButton, Menu, MenuItem,
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, FormControl, InputLabel, Select,
} from '@mui/material';
import {
    Edit as EditIcon,
    AdminPanelSettings as AdminIcon,
    Person as UserIcon,
    MoreVert as MoreIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import api from '../api/api.ts';
import {useAuth} from '../context/AuthContext';
import type {User} from '../types/auth';

const AdminPanel: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [snackbar, setSnackbar] = useState<{ message: string, severity: 'success' | 'error' } | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement, userId: number } | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, user: User | null }>({open: false, user: null});
    const [createUserDialog, setCreateUserDialog] = useState<boolean>(false);
    const [creating, setCreating] = useState<boolean>(false);

    // Stato per il form di creazione utente
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user'
    });

    const navigate = useNavigate();
    const {user: currentUser, refreshUser, logout} = useAuth();

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
            setSnackbar({message: 'Errore nel recuperare gli utenti', severity: 'error'});
        } finally {
            setLoading(false);
        }
    };

    // FUNZIONE PER CREARE UN NUOVO UTENTE
    const handleCreateUser = async () => {
        setCreating(true);
        try {
            await api.post('/register', newUser);

            setSnackbar({
                message: 'Utente creato con successo',
                severity: 'success'
            });

            // Ricarica la lista utenti
            void fetchUsers();

            // Chiudi il dialog e resetta il form
            setCreateUserDialog(false);
            setNewUser({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                role: 'user'
            });

        } catch (err: any) {
            console.error(err);
            setSnackbar({
                message: err.response?.data?.message || 'Errore nella creazione dell\'utente',
                severity: 'error'
            });
        } finally {
            setCreating(false);
        }
    };

    const toggleAdminRole = async (userId: number, currentRole: 'admin' | 'user') => {
        setActionLoading(userId);
        setMenuAnchor(null);

        try {
            const newRole = currentRole === 'admin' ? 'user' : 'admin';
            await api.post(`/users/${userId}/assign-role`, {role: newRole});

            setSnackbar({
                message: currentRole === 'admin'
                    ? 'Utente retrocesso a user'
                    : 'Utente promosso a admin',
                severity: 'success'
            });

            void fetchUsers();

            if (currentUser && userId === currentUser.id) {
                await refreshUser();
            }

        } catch (err: any) {
            console.error(err);
            setSnackbar({message: err.response?.data?.message || 'Errore nel cambiare il ruolo', severity: 'error'});
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
        setMenuAnchor({element: event.currentTarget, userId});
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const getCurrentRole = (user: User): 'admin' | 'user' => {
        return isUserAdmin(user) ? 'admin' : 'user';
    };

    // FUNZIONALITÀ DI ELIMINAZIONE
    const handleDeleteClick = (user: User) => {
        setMenuAnchor(null);
        setDeleteDialog({open: true, user});
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.user) return;

        const userId = deleteDialog.user.id;
        setActionLoading(userId);

        try {
            await api.delete(`/users/${userId}`);

            setSnackbar({
                message: 'Utente eliminato con successo',
                severity: 'success'
            });

            // Ricarica la lista utenti
            void fetchUsers();

            // Se l'utente ha eliminato se stesso, effettua il logout
            if (currentUser && userId === currentUser.id) {
                await logoutAndRedirect();
            }

        } catch (err: any) {
            console.error(err);
            setSnackbar({
                message: err.response?.data?.message || 'Errore nell\'eliminare l\'utente',
                severity: 'error'
            });
        } finally {
            setActionLoading(null);
            setDeleteDialog({open: false, user: null});
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({open: false, user: null});
    };

    const logoutAndRedirect = async () => {
        await logout();
        navigate('/login');
    };

    const canDeleteUser = (targetUser: User): boolean => {
        if (!currentUser) return false;

        // L'admin può eliminare qualsiasi utente tranne se stesso
        if (isUserAdmin(currentUser)) {
            return targetUser.id !== currentUser.id;
        }

        // L'utente normale può eliminare solo se stesso
        return targetUser.id === currentUser.id;
    };

    const isCurrentUser = (targetUser: User): boolean => {
        return currentUser ? targetUser.id === currentUser.id : false;
    };

    // Resetta il form quando si apre/chiude il dialog
    const handleCreateDialogOpen = () => {
        setNewUser({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'user'
        });
        setCreateUserDialog(true);
    };

    const handleCreateDialogClose = () => {
        setCreateUserDialog(false);
    };

    const handleNewUserChange = (field: string, value: string) => {
        setNewUser(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Verifica se il form è valido
    const isFormValid = () => {
        return (
            newUser.name.trim() !== '' &&
            newUser.email.trim() !== '' &&
            newUser.password.length >= 6 &&
            newUser.password === newUser.password_confirmation
        );
    };

    return (
        <Container maxWidth="lg" sx={{py: 4}}>
            {/* Header con Titolo e Pulsante Crea Utente */}
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4}}>
                <Typography variant="h4" gutterBottom>
                    Gestione Utenti
                </Typography>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateDialogOpen}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1
                    }}
                >
                    Crea Nuovo Utente
                </Button>
            </Box>

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
                        <CircularProgress/>
                    </Box>
                ) : (
                    <Table sx={{minWidth: 650}}>
                        <TableHead>
                            <TableRow sx={{backgroundColor: 'primary.main'}}>
                                <TableCell sx={{color: 'white', fontWeight: 'bold', fontSize: '1rem'}}>
                                    ID
                                </TableCell>
                                <TableCell sx={{color: 'white', fontWeight: 'bold', fontSize: '1rem'}}>
                                    Nome
                                </TableCell>
                                <TableCell sx={{color: 'white', fontWeight: 'bold', fontSize: '1rem'}}>
                                    Email
                                </TableCell>
                                <TableCell sx={{color: 'white', fontWeight: 'bold', fontSize: '1rem'}}>
                                    Email Verificata
                                </TableCell>
                                <TableCell sx={{color: 'white', fontWeight: 'bold', fontSize: '1rem'}}>
                                    Ruoli
                                </TableCell>
                                <TableCell sx={{color: 'white', fontWeight: 'bold', fontSize: '1rem', textAlign: 'center'}}>
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
                                    <TableCell sx={{fontWeight: 'medium'}}>
                                        {user.id}
                                    </TableCell>
                                    <TableCell sx={{fontWeight: 'medium'}}>
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
                                        <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap'}}>
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
                                        <Box sx={{display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center'}}>
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
                                                <EditIcon/>
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
                                                    <CircularProgress size={20}/>
                                                ) : (
                                                    <MoreIcon/>
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

            {/* Menu per azioni */}
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
                    const canDelete = canDeleteUser(user);
                    const isSelf = isCurrentUser(user);

                    const menuItems = [];

                    // Mostra il toggle ruolo SOLO se non è l'utente corrente
                    if (!isSelf) {
                        menuItems.push(
                            <MenuItem
                                key="role-toggle"
                                onClick={() => toggleAdminRole(user.id, currentRole)}
                                disabled={actionLoading === user.id}
                            >
                                {isAdmin ? (
                                    <>
                                        <UserIcon sx={{mr: 1}}/>
                                        Retrocedi a User
                                    </>
                                ) : (
                                    <>
                                        <AdminIcon sx={{mr: 1}}/>
                                        Promuovi a Admin
                                    </>
                                )}
                            </MenuItem>
                        );
                    }

                    if (canDelete) {
                        menuItems.push(
                            <MenuItem
                                key="delete"
                                onClick={() => handleDeleteClick(user)}
                                disabled={actionLoading === user.id}
                                sx={{color: 'error.main'}}
                            >
                                <DeleteIcon sx={{mr: 1}}/>
                                {isSelf ? 'Elimina il mio account' : 'Elimina utente'}
                            </MenuItem>
                        );
                    }

                    return menuItems;
                })()}
            </Menu>

            {/* Dialog di conferma eliminazione */}
            <Dialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Conferma Eliminazione
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {deleteDialog.user && isCurrentUser(deleteDialog.user)
                            ? 'Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile e perderai tutti i tuoi dati.'
                            : `Sei sicuro di voler eliminare l'utente "${deleteDialog.user?.name}"? Questa azione è irreversibile.`
                        }
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} disabled={actionLoading === deleteDialog.user?.id}>
                        Annulla
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={actionLoading === deleteDialog.user?.id}
                    >
                        {actionLoading === deleteDialog.user?.id ? (
                            <CircularProgress size={20} color="inherit"/>
                        ) : (
                            'Elimina'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog per creare nuovo utente */}
            <Dialog
                open={createUserDialog}
                onClose={handleCreateDialogClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        Crea Nuovo Utente
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, mt: 2}}>
                        <TextField
                            label="Nome completo"
                            value={newUser.name}
                            onChange={(e) => handleNewUserChange('name', e.target.value)}
                            fullWidth
                            variant="outlined"
                        />
                        <TextField
                            label="Email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => handleNewUserChange('email', e.target.value)}
                            fullWidth
                            variant="outlined"
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => handleNewUserChange('password', e.target.value)}
                            fullWidth
                            variant="outlined"
                            helperText="La password deve essere di almeno 6 caratteri"
                        />
                        <TextField
                            label="Conferma Password"
                            type="password"
                            value={newUser.password_confirmation}
                            onChange={(e) => handleNewUserChange('password_confirmation', e.target.value)}
                            fullWidth
                            variant="outlined"
                            error={newUser.password !== newUser.password_confirmation && newUser.password_confirmation !== ''}
                            helperText={
                                newUser.password !== newUser.password_confirmation && newUser.password_confirmation !== ''
                                    ? 'Le password non coincidono'
                                    : ''
                            }
                        />
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Ruolo</InputLabel>
                            <Select
                                value={newUser.role}
                                onChange={(e) => handleNewUserChange('role', e.target.value)}
                                label="Ruolo"
                            >
                                <MenuItem value="user">User</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCreateDialogClose} disabled={creating}>
                        Annulla
                    </Button>
                    <Button
                        onClick={handleCreateUser}
                        color="primary"
                        variant="contained"
                        disabled={!isFormValid() || creating}
                        startIcon={creating ? <CircularProgress size={20} color="inherit"/> : undefined}
                    >
                        {creating ? 'Creazione...' : 'Crea Utente'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!snackbar}
                autoHideDuration={4000}
                onClose={() => setSnackbar(null)}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
            >
                {snackbar ? (
                    <Alert
                        severity={snackbar.severity}
                        onClose={() => setSnackbar(null)}
                        sx={{width: '100%'}}
                    >
                        {snackbar.message}
                    </Alert>
                ) : undefined}
            </Snackbar>
        </Container>
    );
};

export default AdminPanel;
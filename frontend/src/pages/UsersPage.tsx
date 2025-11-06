import React, { useEffect, useState } from 'react';
import api from '../api/api';
import type {User} from '../types/auth';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

export const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const { user, hasRole, hasPermission } = useAuth();

    useEffect(() => {
        void fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const response = await api.get<User[]>('/users');
        setUsers(response.data);
    };

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '';
        return format(new Date(dateStr), 'dd/MM/yyyy HH:mm');
    };

    return (
        <Paper>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map(u => (
                        <TableRow key={u.id}>
                            <TableCell>{u.id}</TableCell>
                            <TableCell>{u.name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>{formatDate(u.created_at)}</TableCell>
                            <TableCell>
                                {hasRole('admin') && (
                                    <>
                                        <Button color="primary" variant="contained" size="small">
                                            Edit
                                        </Button>
                                        <Button
                                            color="error"
                                            variant="contained"
                                            size="small"
                                            style={{ marginLeft: 8 }}
                                        >
                                            Delete
                                        </Button>
                                    </>
                                )}
                                {hasPermission('edit self') && u.id === user?.id && (
                                    <Button color="secondary" variant="contained" size="small">
                                        Edit Self
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
};

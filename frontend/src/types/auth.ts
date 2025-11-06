// src/types/auth.ts

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    // Rimossi created_at e updated_at se non vengono più inviati
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    created_at: string;
    updated_at: string;
    roles: Role[];           // Ora è sempre presente, non opzionale
    permissions: string[];   // Ora è sempre presente, non opzionale
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
    // Rimossi roles e permissions duplicati poiché sono già in user
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role?: string;
}

export interface RegisterResponse {
    message: string;
    user: User;
}

export interface ApiResponse<T> {
    data?: T;
    message?: string;
    success?: boolean;
}
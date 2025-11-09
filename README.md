User Management System
Sistema di gestione utenti con autenticazione, autorizzazione basata su ruoli e dashboard amministrativa.

1 Installazione & Avvio Rapido:
git clone https://github.com/Vsevolod230287/user-management.git
cd user-management

2 Avvia l'applicazione:
docker-compose up -d

Attendi il completamento:
L'applicazione sarà disponibile in circa 1-2 minuti.

Accesso all'Applicazione:
Frontend (React): http://localhost:3000
Backend API (Laravel): http://localhost:8000
phpMyAdmin: http://localhost:8080

Account Preconfigurati:
Ruolo: Super Admin - Accesso completo
Email: admin@example.com
Password: pasword123

Admin:
-creazione utenti
-modifica se stesso e utenti
-promuove o retrocede utenti da user ad'admin e viceversa
-non può retrocedere se stesso
-non può eliminare se stesso

User:
-acesso solo al proprio profilo
-può modificare se stesso
-può eliminare se stesso

Tema:
-scuro(default)
-bianco




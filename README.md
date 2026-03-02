# AWF Records System

System zarządzania rekordami sportowymi dla Akademii Wychowania Fizycznego.

## Stos Technologiczny

| Warstwa | Technologia |
|---------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, Recharts |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, Zod |
| **Baza danych** | PostgreSQL 16 |
| **Autoryzacja** | JWT (access + refresh tokens) |
| **Upload wideo** | Multer (lokalny storage) |

## Szybki start

### 1. Uruchom bazę danych
```bash
docker-compose up -d
```

### 2. Zainstaluj zależności
```bash
npm install
```

### 3. Wykonaj migrację i seed
```bash
cd apps/backend
npx prisma migrate dev --name init
npx prisma generate
npm run db:seed
```

### 4. Uruchom aplikację
**Windows** — kliknij `start.bat`

**Ręcznie:**
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

### 5. Otwórz przeglądarkę
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

### Dane logowania
| Rola | Email | Hasło |
|------|-------|-------|
| Admin | `admin@awf.edu.pl` | `Admin123!` |
| Zawodnik | `jan.kowalski@student.awf.edu.pl` | `Zawodnik123!` |

## Struktura projektu

```
awf-records/
├── apps/
│   ├── backend/          # Express + Prisma API
│   │   ├── prisma/       # Schema, seed, migrations
│   │   └── src/
│   │       ├── routes/   # Auth, Users, Disciplines, Results, Records, Videos, Statistics
│   │       ├── services/ # Record detection logic
│   │       ├── middleware/# JWT auth, rate limiting, audit logging
│   │       └── lib/      # Prisma client
│   └── frontend/         # React + Vite SPA
│       └── src/
│           ├── pages/    # 18 page components
│           ├── components/# UI components, layout
│           ├── services/ # API client with Axios interceptors
│           ├── stores/   # Zustand auth store
│           └── lib/      # Utilities, constants
├── packages/shared/      # Shared types and validators
├── docker-compose.yml    # PostgreSQL
└── start.bat             # Windows launcher
```

## Funkcjonalności

- **Dashboard** — statystyki, wykresy, ostatnie rekordy i wyniki
- **Zarządzanie wynikami** — dodawanie, edycja, import CSV, eksport
- **Automatyczne wykrywanie rekordów** — uczelni, wydziału, osobiste (z podziałem na płeć)
- **Weryfikacja rekordów** — panel admin/moderator z odtwarzaczem wideo inline
- **Profile zawodników** — historia wyników, personal bests, wykresy progresji
- **Ranking zawodników** — filtrowanie po wydziale, płci, z wyszukiwarką
- **Moduł wideo** — upload drag&drop, galeria z odtwarzaczem
- **Panel administracyjny** — użytkownicy, dyscypliny, audit log
- **Statystyki** — porównania, trendy, ranking wydziałów

## API Endpoints

| Grupa | Prefix | Metody |
|-------|--------|--------|
| Auth | `/api/auth` | register, login, refresh-token, me, change-password |
| Users | `/api/users` | CRUD, results, records, personal-bests, statistics |
| Disciplines | `/api/disciplines` | CRUD, records, statistics |
| Results | `/api/results` | CRUD, import CSV, export CSV |
| Records | `/api/records` | list, pending, history, timeline, verify |
| Videos | `/api/videos` | upload, list, delete, review |
| Statistics | `/api/statistics` | dashboard, compare, trends, faculty-ranking, audit-log |

## Role użytkowników

| Rola | Uprawnienia |
|------|-------------|
| **ADMIN** | Pełny dostęp, zarządzanie użytkownikami i rolami |
| **MODERATOR** | Weryfikacja rekordów, zarządzanie wynikami i dyscyplinami |
| **ATHLETE** | Dodawanie własnych wyników, upload wideo |
| **VIEWER** | Przeglądanie danych (tylko odczyt) |

## Zmienne środowiskowe

Plik `apps/backend/.env` (kopiuj z `.env.example`):

```env
DATABASE_URL="postgresql://awf_user:awf_password@localhost:5432/awf_records"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
PORT=3001
FRONTEND_URL=http://localhost:5173
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=500
```

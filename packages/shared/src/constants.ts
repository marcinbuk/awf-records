export const FACULTIES = [
    'Wydział Wychowania Fizycznego',
    'Wydział Sportu',
    'Wydział Rehabilitacji Ruchowej',
    'Wydział Turystyki i Rekreacji',
    'Wydział Nauk o Zdrowiu',
] as const;

export const DISCIPLINE_CATEGORY_LABELS: Record<string, string> = {
    TRACK: 'Biegi',
    FIELD: 'Konkurencje techniczne',
    SWIMMING: 'Pływanie',
    GYMNASTICS: 'Gimnastyka',
    TEAM_SPORT: 'Sporty drużynowe',
    STRENGTH: 'Sporty siłowe',
    ENDURANCE: 'Wytrzymałość',
    CUSTOM: 'Niestandardowe',
    OTHER: 'Inne',
};

export const MEASUREMENT_UNIT_LABELS: Record<string, string> = {
    SECONDS: 'Sekundy (s)',
    MINUTES: 'Minuty (min)',
    METERS: 'Metry (m)',
    CENTIMETERS: 'Centymetry (cm)',
    KILOGRAMS: 'Kilogramy (kg)',
    POINTS: 'Punkty (pkt)',
    REPETITIONS: 'Powtórzenia',
    CUSTOM: 'Niestandardowe',
};

export const RECORD_STATUS_LABELS: Record<string, string> = {
    PENDING: 'Oczekujący',
    VERIFIED: 'Zweryfikowany',
    REJECTED: 'Odrzucony',
    SUPERSEDED: 'Pobity',
};

export const RECORD_TYPE_LABELS: Record<string, string> = {
    UNIVERSITY: 'Rekord uczelni',
    FACULTY: 'Rekord wydziału',
    YEAR_GROUP: 'Rekord rocznika',
    PERSONAL_BEST: 'Rekord życiowy',
};

export const GENDER_LABELS: Record<string, string> = {
    MALE: 'Mężczyzna',
    FEMALE: 'Kobieta',
};

export const USER_STATUS_LABELS: Record<string, string> = {
    STUDENT: 'Student',
    ALUMNI: 'Absolwent',
    STAFF: 'Pracownik',
    EXTERNAL: 'Zewnętrzny',
};

export const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Administrator',
    MODERATOR: 'Moderator',
    ATHLETE: 'Zawodnik',
    VIEWER: 'Widz',
};

export const GAME_STATUS_LABELS: Record<string, string> = {
    DRAFT: 'Szkic',
    UPCOMING: 'Nadchodzące',
    ACTIVE: 'Aktywne',
    SCORING: 'Punktowanie',
    COMPLETED: 'Zakończone',
    CANCELLED: 'Anulowane',
};

export const MONTHS_PL = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
];

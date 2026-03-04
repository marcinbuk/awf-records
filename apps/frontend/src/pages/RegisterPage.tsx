import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input, Select, FormField, Spinner } from '@/components/ui';
import { toast } from '@/components/ui/toaster';

const schema = z.object({
    email: z.string().email('Nieprawidłowy email'),
    password: z.string().min(8, 'Hasło min. 8 znaków'),
    firstName: z.string().min(2, 'Imię jest wymagane'),
    lastName: z.string().min(2, 'Nazwisko jest wymagane'),
    gender: z.enum(['MALE', 'FEMALE']),
    studentId: z.string().optional(),
    faculty: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const res = await authApi.register(data);
            const { user, accessToken, refreshToken } = res.data.data;
            setAuth(user, accessToken, refreshToken);
            navigate('/');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Błąd rejestracji';
            toast({ title: 'Błąd', description: message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
                        <span className="text-primary-foreground font-black text-xl">AWF</span>
                    </div>
                    <h1 className="text-2xl font-bold gradient-text">Rejestracja</h1>
                    <p className="text-muted-foreground text-sm mt-1">AWF Records System</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8 card-glow">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Imię" error={errors.firstName?.message}>
                                <Input placeholder="Jan" {...register('firstName')} />
                            </FormField>
                            <FormField label="Nazwisko" error={errors.lastName?.message}>
                                <Input placeholder="Kowalski" {...register('lastName')} />
                            </FormField>
                        </div>
                        <FormField label="Email" error={errors.email?.message}>
                            <Input type="email" placeholder="jan@awf.edu.pl" {...register('email')} />
                        </FormField>
                        <FormField label="Hasło" error={errors.password?.message}>
                            <Input type="password" placeholder="••••••••" {...register('password')} />
                        </FormField>
                        <FormField label="Płeć" error={errors.gender?.message}>
                            <Select {...register('gender')}>
                                <option value="">Wybierz płeć</option>
                                <option value="MALE">Mężczyzna</option>
                                <option value="FEMALE">Kobieta</option>
                            </Select>
                        </FormField>
                        <FormField label="Wydział" error={errors.faculty?.message}>
                            <Input placeholder="Wydział Wychowania Fizycznego" {...register('faculty')} />
                        </FormField>
                        <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                            {isLoading ? <><Spinner size="sm" /> Rejestrowanie...</> : 'Zarejestruj się'}
                        </Button>
                    </form>
                    <div className="mt-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Masz konto? <Link to="/login" className="text-primary font-medium">Zaloguj się</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

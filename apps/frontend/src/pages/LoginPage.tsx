import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input, Label, FormField, Spinner } from '@/components/ui';
import { toast } from '@/components/ui/toaster';

const schema = z.object({
    email: z.string().email('Nieprawidłowy email'),
    password: z.string().min(1, 'Hasło jest wymagane'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const res = await authApi.login(data);
            const { user, accessToken, refreshToken } = res.data.data;
            setAuth(user, accessToken, refreshToken);
            navigate('/');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Błąd logowania';
            toast({ title: 'Błąd', description: message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
                        <span className="text-primary-foreground font-black text-xl">AWF</span>
                    </div>
                    <h1 className="text-2xl font-bold gradient-text">AWF Records System</h1>
                    <p className="text-muted-foreground text-sm mt-1">System zarządzania rekordami sportowymi</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8 card-glow">
                    <h2 className="text-xl font-semibold mb-6">Zaloguj się</h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <FormField label="Adres email" error={errors.email?.message}>
                            <Input
                                type="email"
                                placeholder="jan@awf.edu.pl"
                                autoComplete="email"
                                {...register('email')}
                            />
                        </FormField>

                        <FormField label="Hasło" error={errors.password?.message}>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                {...register('password')}
                            />
                        </FormField>

                        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                            {isLoading ? <><Spinner size="sm" /> Logowanie...</> : 'Zaloguj się'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Nie masz konta?{' '}
                            <Link to="/register" className="text-primary hover:text-primary/80 font-medium">
                                Zarejestruj się
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-xs text-muted-foreground font-mono">
                            Demo: admin@awf.edu.pl / Admin123!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

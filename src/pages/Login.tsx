import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import { Box } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
            <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <Box size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cargas PBC</h1>
                    <p className="text-sm text-slate-500">Acesse seu painel de logística</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200">
                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={[]}
                    theme="light"
                    localization={{
                        variables: {
                            sign_in: {
                                email_label: 'Seu endereço de e-mail',
                                password_label: 'Sua senha',
                                button_label: 'Entrar',
                                social_provider_text: 'Entrar com {{provider}}',
                                link_text: 'Já tem uma conta? Entre',
                            },
                            sign_up: {
                                email_label: 'Seu endereço de e-mail',
                                password_label: 'Sua senha',
                                button_label: 'Registrar',
                                social_provider_text: 'Registrar com {{provider}}',
                                link_text: 'Não tem uma conta? Registre-se',
                            },
                            forgotten_password: {
                                email_label: 'Seu endereço de e-mail',
                                button_label: 'Enviar instruções',
                                link_text: 'Esqueceu sua senha?',
                            },
                        },
                    }}
                />
            </div>
             <p className="text-center text-xs text-slate-400 mt-6">
                © 2024 Cargas PBC. Todos os direitos reservados.
            </p>
        </div>
    </div>
  );
};

export default Login;
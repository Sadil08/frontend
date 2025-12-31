import AuthForm from '@/components/AuthForm';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 p-4">
      <AuthForm isRegister={true} />
    </div>
  );
}

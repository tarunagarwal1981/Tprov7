import { Suspense } from 'react';
import { ModernRegisterForm } from '@/components/auth/ModernRegisterForm';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ModernRegisterForm />
    </Suspense>
  );
}
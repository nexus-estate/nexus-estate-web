'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdministrationSession } from '@/features/auth/administration/administration-session.provider';
export default function AdminLoginPage() {
  const { login } = useAdministrationSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  return (
    <div className="mx-auto mt-20 max-w-md rounded-xl bg-white p-8 shadow">
      <p className="eyebrow">Internal access</p>
      <h1 className="mt-3 text-3xl font-bold text-[#102f2d]">
        Administration login
      </h1>
      <form
        className="mt-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError('');
          try {
            await login(email, password);
            router.replace('/admin');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to sign in');
          } finally {
            setLoading(false);
          }
        }}
      >
        <input
          className="auth-input"
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="auth-input"
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button disabled={loading} className="auth-submit" type="submit">
          {loading ? 'Signing in…' : 'Sign in'} <span>→</span>
        </button>
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Heart, Mail, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Use production URL from env, fallback to current origin for local dev
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Check your email</h2>
          <p className="text-gray-500 mb-6">
            We sent a magic link to <span className="font-medium text-gray-700">{email}</span>
          </p>
          <p className="text-sm text-gray-400">
            Click the link in the email to sign in
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-6 text-rose-500 hover:text-rose-600 text-sm font-medium"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full shadow-lg mb-4">
          <Heart className="w-10 h-10 text-white fill-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Us</h1>
        <p className="text-gray-500">Our Date Planner</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-rose-400" />
          <span className="text-sm text-gray-500">Sign in with magic link</span>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-gray-800 placeholder:text-gray-400"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-400 to-rose-500 text-white font-medium rounded-xl hover:from-rose-500 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                Send Magic Link
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-gray-400 mt-6">
        A shared space for you and your partner 💕
      </p>
    </div>
  );
}

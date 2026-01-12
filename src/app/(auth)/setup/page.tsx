'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Heart, Users, Link2, Loader2, Calendar, Copy, Check } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [step, setStep] = useState<'choice' | 'create' | 'join'>('choice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coupleCode, setCoupleCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: '',
    partnerName: '',
    anniversaryDate: '',
  });

  const generateCoupleCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateCouple = async () => {
    if (!formData.displayName || !formData.anniversaryDate) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newCode = generateCoupleCode();

      // Create couple
      const { error: coupleError } = await supabase
        .from('couples')
        .insert({
          id: newCode,
          anniversary_date: formData.anniversaryDate,
          partner1_name: formData.displayName,
        });

      if (coupleError) throw coupleError;

      // Update profile with couple_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          couple_id: newCode,
          display_name: formData.displayName 
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setGeneratedCode(newCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCouple = async () => {
    if (!coupleCode || !formData.displayName) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if couple exists
      const { data: couple, error: coupleError } = await supabase
        .from('couples')
        .select('*')
        .eq('id', coupleCode.toUpperCase())
        .single();

      if (coupleError || !couple) {
        throw new Error('Invalid couple code');
      }

      // Update couple with partner2 name
      await supabase
        .from('couples')
        .update({ partner2_name: formData.displayName })
        .eq('id', coupleCode.toUpperCase());

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          couple_id: coupleCode.toUpperCase(),
          display_name: formData.displayName 
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (generatedCode) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">You&apos;re all set!</h2>
          <p className="text-gray-500 mb-6">
            Share this code with your partner so they can join
          </p>
          
          <div className="bg-rose-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-rose-400 mb-2">Your couple code</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-bold text-rose-500 tracking-widest">
                {generatedCode}
              </span>
              <button
                onClick={copyCode}
                className="p-2 hover:bg-rose-100 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5 text-rose-400" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-400 to-rose-500 text-white font-medium rounded-xl hover:from-rose-500 hover:to-rose-600 transition-all"
          >
            Continue to App
          </button>
        </div>
      </div>
    );
  }

  if (step === 'choice') {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full shadow-lg mb-4">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Us</h1>
          <p className="text-gray-500">Let&apos;s set up your shared space</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setStep('create')}
            className="w-full bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                <Users className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Create a new couple</h3>
                <p className="text-sm text-gray-500">
                  Start fresh and invite your partner
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setStep('join')}
            className="w-full bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <Link2 className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Join your partner</h3>
                <p className="text-sm text-gray-500">
                  Enter the code they shared with you
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'create') {
    return (
      <div className="w-full max-w-md">
        <button
          onClick={() => setStep('choice')}
          className="text-gray-500 hover:text-gray-700 mb-4 text-sm"
        >
          ← Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Create your couple space</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Anniversary date
              </label>
              <input
                type="date"
                value={formData.anniversaryDate}
                onChange={(e) => setFormData({ ...formData, anniversaryDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleCreateCouple}
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-rose-400 to-rose-500 text-white font-medium rounded-xl hover:from-rose-500 hover:to-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create & Get Code'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <button
        onClick={() => setStep('choice')}
        className="text-gray-500 hover:text-gray-700 mb-4 text-sm"
      >
        ← Back
      </button>

      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Join your partner</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Link2 className="w-4 h-4 inline mr-1" />
              Couple code
            </label>
            <input
              type="text"
              value={coupleCode}
              onChange={(e) => setCoupleCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all uppercase tracking-widest text-center text-lg font-semibold"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleJoinCouple}
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-400 to-rose-500 text-white font-medium rounded-xl hover:from-rose-500 hover:to-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Partner'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

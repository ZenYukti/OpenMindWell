import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInAnonymously, createProfile } from '../lib/supabase';

const AVATAR_OPTIONS = ['😊', '😎', '🌟', '🌈', '🦋', '🌸', '🎨', '🎭', '🎵', '🌿'];

export default function Onboarding() {
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('😊');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    if (nickname.length < 3 || nickname.length > 20) {
      setError('Nickname must be 3-20 characters');
      return;
    }

    setLoading(true);

    try {
      // Sign in anonymously
      const { data: authData, error: authError } = await signInAnonymously();

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Failed to create anonymous account');
      }

      // Create profile
      const { error: profileError } = await createProfile(
        authData.user.id,
        nickname.trim(),
        selectedAvatar
      );

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Crisis Banner */}
        <div className="bg-red-600 text-white py-2 px-4 rounded-lg text-center text-sm mb-6">
          <strong>⚠️ IN CRISIS?</strong> 🇺🇸 988 | 🇮🇳 9152987821 (iCall) | KIRAN 1800-599-0019
        </div>

        <div className="card">
          <h1 className="text-3xl font-bold text-center mb-6">Create Your Profile</h1>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <strong>🔒 Your privacy matters:</strong> We don't collect personal information.
              Choose a nickname and avatar to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Nickname Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose a Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g., HopefulHeart123"
                className="input-field"
                maxLength={20}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">3-20 characters, no personal info</p>
            </div>

            {/* Avatar Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose an Avatar
              </label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 gap-2">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`text-4xl p-3 rounded-lg border-2 transition-all ${
                      selectedAvatar === avatar
                        ? 'border-primary-600 bg-primary-50 scale-110'
                        : 'border-gray-300 hover:border-primary-400'
                    }`}
                    disabled={loading}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Continue →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              By continuing, you acknowledge that OpenMindWell is not a substitute for professional mental health care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

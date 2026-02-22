import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    // No real auth yet — just go to dashboard
    setTimeout(() => navigate('/'), 600);
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      {/* Subtle gold glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-lg bg-brand-gold flex items-center justify-center text-brand-bg text-2xl font-bold mb-4 shadow-lg shadow-brand-gold/20">
            SE
          </div>
          <h1 className="text-xl font-semibold text-brand-text tracking-wide">SOUTHEAST ENTERPRISE</h1>
          <p className="text-brand-muted text-sm mt-1">Enterprise Resource Platform</p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="bg-brand-card border border-brand-border rounded-lg p-8 shadow-2xl">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="matt@southeastenterprise.com"
                className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold/60 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold/60 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-brand-border bg-brand-surface accent-brand-gold" />
              <label htmlFor="remember" className="text-sm text-brand-muted">Keep me signed in</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-gold hover:bg-brand-gold-light text-brand-bg font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-brand-bg/30 border-t-brand-bg rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </div>

          <div className="text-center mt-5">
            <button type="button" className="text-sm text-brand-muted hover:text-brand-gold transition-colors">
              Forgot your password?
            </button>
          </div>
        </form>

        {/* Divisions */}
        <div className="text-center mt-8 text-xs text-brand-muted/60">
          Lending &middot; Construction &middot; Development &middot; Multi-Family &middot; Plumbing &middot; HVAC &middot; Electrical
        </div>
      </div>
    </div>
  );
}

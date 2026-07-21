import React, { useState } from 'react';
import { signInWithRedirect, signIn, confirmSignIn } from 'aws-amplify/auth';
import HelpModal from '../modals/HelpModal';

const LandingPage: React.FC = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await signInWithRedirect({ provider: 'Google' });
    } catch (error) {
      console.error("Error signing in:", error);
      setAuthError(`Sign-in failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const { isSignedIn, nextStep } = await signIn({ 
        username: email, 
        password 
      });
      if (isSignedIn) {
        console.log('Signed in successfully');
      } else {
        if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_SMS_CODE' ||
            nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE') {
          setRequiresMfa(true);
        } else {
          setAuthError(`Unexpected step: ${nextStep.signInStep}`);
        }
      }
    } catch (error: any) {
      console.error("Error during email sign-in:", error);
      if (error.name === 'UserNotFoundException') {
        setAuthError('No account found with this email address. You may need to sign up or use Google.');
      } else if (error.name === 'NotAuthorizedException') {
        setAuthError('Incorrect password. Please try again.');
      } else if (error.name === 'UserNotConfirmedException') {
        setAuthError('This account has not been verified yet. Please sign in with Google instead.');
      } else {
        setAuthError(`Sign-in failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const { isSignedIn } = await confirmSignIn({ challengeResponse: mfaCode });
      if (isSignedIn) {
        console.log('MFA verified, signed in');
      }
    } catch (error: any) {
      setAuthError(`Verification failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg text-white p-6 relative overflow-hidden font-sans">
      {/* Background Texture/Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,30,99,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center space-y-12">

        {/* Branding Area */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <img src="/assets/logo.svg" alt="describeAT Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight font-heading">
            describe<span className="text-brand-primary">AT</span>
          </h1>
        </div>

        {/* Value Prop */}
        <div className="space-y-4">
          <p className="text-xl font-medium text-brand-text">Watch anywhere</p>
          <h2 className="text-4xl font-extrabold font-heading text-white">
            Listen with <br />
            <span className="text-brand-text">describeAT</span>
          </h2>
          <div className="space-y-2">
            <p className="text-brand-accent font-bold text-xl">It's Free!</p>
            <p className="text-brand-text-secondary text-base leading-relaxed max-w-[300px] mx-auto">
              Listen to Audio Descriptions of your favorite Film, Series, Books or TV Shows
            </p>
          </div>
        </div>

        {/* Main Action Group */}
        <div className="w-full space-y-8">
          {!showEmailForm ? (
            <>
              {/* Google sign-in — this opens Safari so may not work well with VoiceOver on PWA */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold py-4 px-8 rounded-md shadow-lg transition-all text-lg tracking-wider uppercase flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isSubmitting ? 'Signing in...' : 'SIGN IN WITH GOOGLE'}
              </button>

              <div className="relative" role="separator" aria-label="or sign in with email">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-brand-surface" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-brand-bg text-brand-text-secondary">or</span>
                </div>
              </div>

              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full border border-brand-surface hover:bg-brand-surface text-brand-text font-bold py-4 px-8 rounded-md transition-all text-base"
              >
                SIGN IN WITH EMAIL
              </button>
            </>
          ) : requiresMfa ? (
            <form onSubmit={handleMfaSubmit} className="w-full space-y-4 text-left">
              <p className="text-brand-text text-sm">Enter the verification code from your authenticator app:</p>
              <input
                type="text"
                inputMode="numeric"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="Verification code"
                autoFocus
                className="w-full bg-brand-surface border border-brand-surface-light rounded-md px-4 py-3 text-white text-lg text-center tracking-widest focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                aria-label="Verification code"
                autoComplete="one-time-code"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-4 px-8 rounded-md shadow-lg transition-all text-lg tracking-wider"
              >
                {isSubmitting ? 'Verifying...' : 'VERIFY'}
              </button>
              <button
                type="button"
                onClick={() => { setRequiresMfa(false); setMfaCode(''); setAuthError(null); }}
                className="w-full text-brand-text-secondary text-sm hover:text-white transition-colors"
              >
                Back to sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailSignIn} className="w-full space-y-4 text-left">
              <div>
                <label htmlFor="signin-email" className="sr-only">Email address</label>
                <input
                  id="signin-email"
                  type="text"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  autoFocus
                  className="w-full bg-brand-surface border border-brand-surface-light rounded-md px-4 py-3 text-white text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                  aria-label="Email address"
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="signin-password" className="sr-only">Password</label>
                <input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-brand-surface border border-brand-surface-light rounded-md px-4 py-3 text-white text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                  aria-label="Password"
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !email || !password}
                className="w-full bg-[#001f3f] hover:bg-[#002b59] text-white font-bold py-4 px-8 rounded-md shadow-lg transition-all text-xl tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in...' : 'SIGN IN'}
              </button>
              <button
                type="button"
                onClick={() => { setShowEmailForm(false); setAuthError(null); }}
                className="w-full text-brand-text-secondary text-sm hover:text-white transition-colors"
              >
                Back to sign in options
              </button>
            </form>
          )}

          {authError && (
            <div role="alert" className="bg-red-900/50 border border-red-500/50 rounded-md p-3 text-red-200 text-sm text-center">
              {authError}
            </div>
          )}

          <button
            onClick={() => setIsHelpOpen(true)}
            className="bg-[#E91E63]/80 hover:bg-[#E91E63] text-white font-bold py-2 px-12 rounded-md transition-all tracking-widest text-sm uppercase"
          >
            HELP
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-8 text-brand-text-secondary/40 text-xs font-medium tracking-widest uppercase">
        &copy; {new Date().getFullYear()} Shazacin Accessible Media
      </footer>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

export default LandingPage;
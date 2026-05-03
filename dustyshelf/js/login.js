import { signInWithEmail, signInWithGoogle, resetPassword, validateEmail } from './auth.js';
import { showToast, showSuccessPopup } from './toast.js';

// ── Password visibility ─────────────────────────────────────────────────────
document.getElementById('togglePwd').addEventListener('click', () => {
  const pwd = document.getElementById('password');
  pwd.type = pwd.type === 'password' ? 'text' : 'password';
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function showError(msg) {
  const el = document.getElementById('error-msg');
  document.getElementById('success-msg').classList.add('hidden');
  el.textContent = msg; el.classList.remove('hidden');
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 500);
  // Highlight fields
  document.getElementById('email').classList.add('invalid');
  document.getElementById('password').classList.add('invalid');
}

function showSuccess(msg) {
  document.getElementById('error-msg').classList.add('hidden');
  const el = document.getElementById('success-msg');
  el.textContent = msg; el.classList.remove('hidden');
}

function hideMessages() {
  document.getElementById('error-msg').classList.add('hidden');
  document.getElementById('success-msg').classList.add('hidden');
  document.getElementById('email').classList.remove('invalid');
  document.getElementById('password').classList.remove('invalid');
}

// ── Enter key support ────────────────────────────────────────────────────────
document.getElementById('password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('loginBtn').click();
});
document.getElementById('email').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('password').focus();
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════════════
document.getElementById('loginBtn').addEventListener('click', async () => {
  hideMessages();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // Frontend validation
  if (!email) { showError('Please enter your email address.'); return; }
  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) { showError('Invalid email format.'); return; }
  if (!password) { showError('Please enter your password.'); return; }

  const btn = document.getElementById('loginBtn');
  try {
    btn.classList.add('btn-loading');
    btn.textContent = 'Signing In';

    // Firebase Auth Login (Client Side)
    await signInWithEmail(email, password);

    // Show "Login Successful" animated popup → redirect to dashboard
    showSuccessPopup("Login Successful", "Welcome back! Redirecting...", {
      redirectUrl: "dashboard.html",
      redirectDelay: 1200,
    });

  } catch (error) {
    const msg = error.message;
    showError(msg);
    showToast(msg, 'error');
    btn.classList.remove('btn-loading');
    btn.textContent = 'Sign In';
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GOOGLE SIGN-IN
// ═══════════════════════════════════════════════════════════════════════════════
document.getElementById('googleLoginBtn').addEventListener('click', async () => {
  hideMessages();
  const btn = document.getElementById('googleLoginBtn');
  try {
    btn.classList.add('btn-loading');
    const user = await signInWithGoogle();
    
    if (user) {
      // Store user info from Firebase directly (no backend needed)
      localStorage.setItem('dustyshelf_user', JSON.stringify({
        id: user.uid,
        name: user.displayName,
        email: user.email,
        role: 'user',
        uid: user.uid
      }));
      
      showSuccessPopup("Login Successful", "Welcome back! Redirecting to your dashboard...", {
        redirectUrl: "dashboard.html",
        redirectDelay: 1200,
      });
    }
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    showError(error.message);
    showToast(error.message, 'error');
  } finally {
    btn.classList.remove('btn-loading');
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD
// ═══════════════════════════════════════════════════════════════════════════════
document.getElementById('forgotPwdBtn').addEventListener('click', () => {
  document.getElementById('forgot-modal').classList.remove('hidden');
  const emailVal = document.getElementById('email').value.trim();
  if (emailVal) document.getElementById('reset-email').value = emailVal;
});

document.getElementById('closeResetModal').addEventListener('click', () => {
  document.getElementById('forgot-modal').classList.add('hidden');
});

// Click outside modal to close
document.getElementById('forgot-modal').addEventListener('click', (e) => {
  if (e.target.id === 'forgot-modal') document.getElementById('forgot-modal').classList.add('hidden');
});

document.getElementById('sendResetBtn').addEventListener('click', async () => {
  const email = document.getElementById('reset-email').value.trim();
  if (!email) { showToast('Please enter your email.', 'warning'); return; }
  const check = validateEmail(email);
  if (!check.valid) { showToast('Invalid email format.', 'warning'); return; }

  const btn = document.getElementById('sendResetBtn');
  try {
    btn.classList.add('btn-loading');
    btn.textContent = 'Sending';
    await resetPassword(email);
    document.getElementById('forgot-modal').classList.add('hidden');
    showSuccess('Password reset link sent! Check your email inbox.');
    showToast('Reset link sent to ' + email, 'success', 5000);
    btn.classList.remove('btn-loading');
    btn.textContent = 'Send Reset Link';
  } catch (error) {
    showToast(error.message, 'error');
    btn.classList.remove('btn-loading');
    btn.textContent = 'Send Reset Link';
  }
});

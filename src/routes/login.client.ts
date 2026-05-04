interface LoginResponse {
  requires2FA?: boolean;
  sessionId?: string;
  has_otp?: boolean;
  notified?: unknown;
  accessToken?: string;
  me?: unknown;
  error?: string;
  message?: string;
}

export function renderLoginScript(): string {
  return `
let sessionId = null;

const hasOtpCheckbox = document.getElementById('hasOtp');
const otpField = document.getElementById('otpField');
const otpCodeInput = document.getElementById('otpCode');

hasOtpCheckbox.addEventListener('change', () => {
  otpField.style.display = hasOtpCheckbox.checked ? 'block' : 'none';
});

function setup2FA(hasOtp) {
  const codeLabel = document.getElementById('codeLabel');
  const codeInput = document.getElementById('code');
  const togglePinBtn = document.getElementById('togglePinBtn');
  const requestPinBtn = document.getElementById('requestPinBtn');

  if (hasOtp) {
    codeLabel.textContent = 'código OTP';
    codeInput.placeholder = '123456';
    codeInput.maxLength = 6;
    codeInput.pattern = '\\\\d{4,6}';
    togglePinBtn.style.display = 'block';
    requestPinBtn.style.display = 'none';
  } else {
    codeLabel.textContent = 'PIN';
    codeInput.placeholder = '1234';
    codeInput.maxLength = 4;
    codeInput.pattern = '\\\\d{4}';
    togglePinBtn.style.display = 'none';
    requestPinBtn.style.display = 'block';
  }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const hasOtp = hasOtpCheckbox.checked;

  const body = { email, password };
  if (hasOtp) {
    const otpCode = otpCodeInput.value.trim();
    if (!otpCode) return showError('Código OTP requerido');
    body.two_factor_code = otpCode;
  }

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = /** @type {LoginResponse} */ (await res.json());

  if (data.requires2FA) {
    sessionId = data.sessionId;
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('step2fa').style.display = 'block';
    setup2FA(data.has_otp);
  } else if (data.accessToken) {
    showToken(data.accessToken);
  } else {
    showError(data.error || 'Error desconocido');
  }
});

document.getElementById('togglePinBtn').addEventListener('click', async () => {
  if (!sessionId) return;

  const codeLabel = document.getElementById('codeLabel');
  const codeInput = document.getElementById('code');
  const togglePinBtn = document.getElementById('togglePinBtn');
  const requestPinBtn = document.getElementById('requestPinBtn');

  codeLabel.textContent = 'PIN';
  codeInput.placeholder = '1234';
  codeInput.maxLength = 4;
  codeInput.pattern = '\\\\d{4}';
  codeInput.value = '';
  togglePinBtn.style.display = 'none';
  requestPinBtn.style.display = 'block';

  await doRequestPin();
});

document.getElementById('requestPinBtn').addEventListener('click', async () => {
  if (!sessionId) return showError('Sin sesión activa');
  await doRequestPin();
});

async function doRequestPin() {
  const btn = document.getElementById('requestPinBtn');
  btn.textContent = 'enviando...';
  btn.style.opacity = '0.5';
  btn.disabled = true;

  const res = await fetch('/api/request-pin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId })
  });
  const data = /** @type {LoginResponse} */ (await res.json());

  btn.textContent = 'solicitar PIN';
  btn.style.opacity = '1';
  btn.disabled = false;

  if (data.message) {
    showError(data.message);
  } else if (data.error) {
    showError(data.error);
  }
}

document.getElementById('verifyBtn').addEventListener('click', async () => {
  const code = document.getElementById('code').value;
  if (!sessionId || !code) return showError('Faltan datos');

  const res = await fetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, two_factor_code: code })
  });
  const data = /** @type {LoginResponse} */ (await res.json());

  if (data.accessToken) {
    showToken(data.accessToken);
  } else {
    showError(data.error || 'Código inválido');
  }
});

function showToken(token) {
  document.getElementById('step2fa').style.display = 'none';
  document.getElementById('result').style.display = 'block';
  document.getElementById('tokenOutput').textContent = token;
}

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 5000);
}

document.getElementById('copyBtn')?.addEventListener('click', () => {
  const token = document.getElementById('tokenOutput').textContent;
  navigator.clipboard.writeText(token);
  alert('✅ Copiado');
});
`;
}

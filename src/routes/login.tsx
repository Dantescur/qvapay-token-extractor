import { Hono } from 'hono'
import { renderLoginScript } from './login.client'

export const login = new Hono<{ Bindings: CloudflareBindings }>()

login.get('/', (c) => {
  return c.render(
    <>
      <header>
        <h1>qvapay/token-extractor</h1>
        <p>extrae tu token bearer para usar la API</p>
      </header>

      <main>
        <form id="loginForm">
          <label htmlFor="email">email</label>
          <input id="email" type="email" placeholder="dev@empresa.com" required autoComplete="email" />

          <label htmlFor="password">contraseña</label>
          <input id="password" type="password" placeholder="········" required autoComplete="current-password" />

          <label htmlFor="hasOtp" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.25rem', userSelect: 'none' }}>
            <input id="hasOtp" type="checkbox" style={{ width: '18px', height: '18px', accentColor: '#ff2d20', cursor: 'pointer', margin: 0 }} />
            <span>tengo OTP activado</span>
          </label>

          <div id="otpField" style={{ display: 'none' }}>
            <label htmlFor="otpCode">código OTP</label>
            <input id="otpCode" type="text" placeholder="123456" maxLength={6} pattern="\d{4,6}" inputMode="numeric" autoComplete="one-time-code" />
          </div>

          <button type="submit">autenticar</button>
        </form>

        <div id="step2fa" style={{ display: 'none' }}>
          <label htmlFor="code" id="codeLabel">código</label>
          <input id="code" type="text" placeholder="" maxLength={6} pattern="\d{4,6}" inputMode="numeric" autoComplete="one-time-code" />

          <button id="verifyBtn">verificar</button>

          <div id="toggle2fa" style={{ marginTop: '0.75rem' }}>
            <button id="togglePinBtn" type="button" style={{ display: 'none', background: 'transparent', border: '1px solid #333', color: '#b0b0b0' }}>usar PIN en vez</button>
            <button id="requestPinBtn" type="button" style={{ display: 'none', background: 'transparent', border: '1px solid #333', color: '#b0b0b0' }}>solicitar PIN</button>
          </div>
        </div>

        <div id="result" style={{ display: 'none' }}>
          <label>token de acceso</label>
          <pre id="tokenOutput"></pre>
          <button id="copyBtn">copiar</button>
        </div>
      </main>

      <p id="error" style={{ display: 'none' }}></p>

      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/help">ayuda</a>
        <a href="https://github.com/Dantescur/qvapay-token-extractor" target="_blank" rel="noopener noreferrer">código ↗</a>
      </footer>

      <script dangerouslySetInnerHTML={{ __html: renderLoginScript() }} />
    </>
  )
})

import { Hono } from "hono";

export const help = new Hono<{ Bindings: CloudflareBindings }>();

help.get("/", (c) => {
  return c.render(
    <>
      <header>
        <img
          src="/logo.webp"
          alt=""
          width="64"
          height="64"
          style={{ display: "block", margin: "0 auto 1rem", imageRendering: "pixelated" }}
        />
        <h1>qvapay/token-extractor</h1>
        <p>cómo funciona y por qué existe</p>
      </header>

      <main>
        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#e8e8e8",
              marginBottom: "0.75rem",
              letterSpacing: "0.04em",
            }}
          >
            el problema
          </h2>
          <p style={{ fontSize: "0.8125rem", lineHeight: 1.6, marginBottom: "0.75rem" }}>
            La API de QVAPay no tiene un endpoint para obtener tokens. Para conseguir un bearer
            token, tienes que pasar por el mismo flujo de login que usa la web: email + contraseña →
            2FA (OTP o PIN) → token de acceso.
          </p>
          <p style={{ fontSize: "0.8125rem", lineHeight: 1.6, color: "#555" }}>
            Este es exactamente el flujo que cualquiera que integre con la API de QVAPay tiene que
            replicar. Es casi imposible de automatizar — la API espera un humano en un navegador.
            Esta herramienta solo hace que ese paso manual sea soportable.
          </p>
        </section>

        <section
          style={{ marginBottom: "2rem", borderTop: "1px solid #1a1a1a", paddingTop: "1.5rem" }}
        >
          <h2
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#e8e8e8",
              marginBottom: "0.75rem",
              letterSpacing: "0.04em",
            }}
          >
            cómo funciona
          </h2>
          <div style={{ fontSize: "0.8125rem", lineHeight: 1.6, color: "#b0b0b0" }}>
            <p style={{ marginBottom: "0.5rem", color: "#555" }}>tres pasos, igual que la web:</p>
            <ol style={{ paddingLeft: "1.25rem", margin: "0.75rem 0" }}>
              <li style={{ marginBottom: "0.5rem" }}>
                ingresa tus credenciales (email + contraseña)
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                si tienes 2FA activado: ingresa tu OTP o pide un PIN por email
              </li>
              <li style={{ marginBottom: "0.5rem" }}>copia el bearer token</li>
            </ol>
          </div>
        </section>

        <section
          style={{ marginBottom: "2rem", borderTop: "1px solid #1a1a1a", paddingTop: "1.5rem" }}
        >
          <h2
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#e8e8e8",
              marginBottom: "0.75rem",
              letterSpacing: "0.04em",
            }}
          >
            modos de 2FA
          </h2>
          <div style={{ fontSize: "0.8125rem", lineHeight: 1.6, color: "#b0b0b0" }}>
            <p style={{ marginBottom: "0.75rem" }}>
              <strong style={{ color: "#e8e8e8" }}>OTP</strong> — si usas una app de autenticación
              (TOTP), marca "tengo OTP activado" para mandar credenciales + OTP en una sola
              petición. un solo viaje.
            </p>
            <p style={{ marginBottom: "0.75rem" }}>
              <strong style={{ color: "#e8e8e8" }}>PIN</strong> — si no tienes OTP activado, QVAPay
              te manda un PIN de 4 dígitos al email. haz clic en "solicitar PIN" para pedir uno,
              después ingrésalo.
            </p>
            <p>
              <strong style={{ color: "#e8e8e8" }}>login directo</strong> — si no tienes 2FA
              configurado, el token llega directamente después de las credenciales.
            </p>
          </div>
        </section>

        <section style={{ borderTop: "1px solid #1a1a1a", paddingTop: "1.5rem" }}>
          <h2
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#e8e8e8",
              marginBottom: "0.75rem",
              letterSpacing: "0.04em",
            }}
          >
            sobre las sesiones
          </h2>
          <p style={{ fontSize: "0.8125rem", lineHeight: 1.6, color: "#555" }}>
            las credenciales se guardan temporalmente en Cloudflare KV solo durante el flujo de 2FA
            (TTL de 10 minutos). se borran inmediatamente después de la verificación. esta
            herramienta no guarda tokens — se muestran una vez y desaparecen.
          </p>
        </section>
      </main>

      <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/">volver</a>
        <a
          href="https://github.com/Dantescur/qvapay-token-extractor"
          target="_blank"
          rel="noopener noreferrer"
        >
          código ↗
        </a>
      </footer>
    </>,
  );
});

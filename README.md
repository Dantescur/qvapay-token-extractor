# qvapay-token-extractor

Extrae tu bearer token de QVAPay para usar la API.

## Por qué existe

QVAPay no tiene un endpoint para obtener tokens. Para conseguir un bearer token tienes que pasar por el mismo login que usa la web: email + contraseña → 2FA → token. Esta herramienta hace ese paso manual.

Es el mismo flujo que cualquier integración con la API de QVAPay necesita replicar, y es casi imposible de automatizar — la API espera un humano en un navegador.

## Cómo funciona

1. Ingresa tus credenciales (email + contraseña)
2. Si tienes 2FA: usa OTP (en un solo paso) o pide un PIN por email
3. Copia el token

## Modo OTP

Si tienes autenticador TOTP (Google Authenticator, Authy, etc.), marca **"tengo OTP activado"** para mandar email + contraseña + OTP en una sola petición. Un solo viaje.

## Modo PIN

Si no tienes OTP, QVAPay te manda un PIN de 4 dígitos al email. Haz clic en "solicitar PIN" y luego ingrésalo.

Si tienes ambos (OTP + PIN), también puedes alternar: entra con OTP y luego usa "usar PIN en vez" para recibir un PIN por email.

## Privacidad

- Las credenciales se guardan temporalmente en Cloudflare KV solo durante el flujo de 2FA (TTL de 10 minutos)
- Se borran inmediatamente después de la verificación
- No se guardan tokens — se muestran una vez y desaparecen

## Deploy

```bash
pnpm install
pnpm run kv:create
```

El segundo comando crea el namespace de KV en tu cuenta de Cloudflare. Copia el ID que imprime y reemplázalo en `wrangler.jsonc`:

```jsonc
"kv_namespaces": [
  {
    "binding": "qvapay-sessions",
    "id": "TU_ID_AQUI"
  }
]
```

Después:

```bash
pnpm run deploy
```

El deploy usa Wrangler y apunta a tu cuenta de Cloudflare. Necesitas tener configurado `wrangler login`.

## Dev

```bash
pnpm install
pnpm run dev
```

Abre `http://localhost:5173`.

## Tech

- [Hono](https://hono.dev/) — framework web
- [Vite](https://vitejs.dev/) — build + dev server
- [Cloudflare Workers](https://workers.cloudflare.com/) — hosting
- [Cloudflare KV](https://developers.cloudflare.com/kv/) — storage temporal de sesiones

import type { ContentfulStatusCode } from "hono/utils/http-status";
import { saveSession, getSession, deleteSession, generateSessionId } from "./utils/kv-session";

interface QvapayResponse {
  has_otp?: boolean;
  notified?: unknown;
  accessToken?: string;
  me?: unknown;
  message?: string;
  [key: string]: unknown;
}

export type LoginResult =
  | { type: "2fa-required"; sessionId: string; has_otp: boolean; notified?: unknown }
  | { type: "success"; accessToken: string; me: unknown }
  | { type: "error"; message: string; status: ContentfulStatusCode };

export type VerifyResult =
  | { type: "success"; accessToken: string; me: unknown }
  | { type: "error"; message: string; status: ContentfulStatusCode };

export type RequestPinResult =
  | { type: "sent"; message: string }
  | { type: "error"; message: string; status: ContentfulStatusCode };

interface QvapayAuthDeps {
  kv: KVNamespace;
  qvapayApiUrl: string;
}

export function createQvapayAuth(deps: QvapayAuthDeps) {
  async function login(email: string, password: string, otpCode?: string): Promise<LoginResult> {
    const res = await fetch(`${deps.qvapayApiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        remember: true,
        ...(otpCode && { two_factor_code: otpCode }),
      }),
    });

    const data = (await res.json()) as QvapayResponse;

    if (res.status === 202 || data.has_otp) {
      const sessionId = generateSessionId();
      await saveSession(deps.kv, sessionId, { email, password, createdAt: Date.now() });
      return { type: "2fa-required", sessionId, has_otp: !!data.has_otp, notified: data.notified };
    }

    if (res.ok && data.accessToken) {
      return { type: "success", accessToken: data.accessToken, me: data.me };
    }

    return {
      type: "error",
      message: data.message || "Credenciales inválidas",
      status: (res.status === 401 ? 401 : 400) as ContentfulStatusCode,
    };
  }

  async function verify2FA(sessionId: string, code: string): Promise<VerifyResult> {
    const session = await getSession(deps.kv, sessionId);
    if (!session) {
      return { type: "error", message: "Sesión expirada o inválida", status: 400 };
    }

    const res = await fetch(`${deps.qvapayApiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.email,
        password: session.password,
        remember: true,
        two_factor_code: code,
      }),
    });

    await deleteSession(deps.kv, sessionId);

    const data = (await res.json()) as QvapayResponse;

    if (res.ok && data.accessToken) {
      return { type: "success", accessToken: data.accessToken, me: data.me };
    }

    return { type: "error", message: data.message || "Código inválido", status: 401 };
  }

  async function requestPin(sessionId: string): Promise<RequestPinResult> {
    const session = await getSession(deps.kv, sessionId);
    if (!session) {
      return { type: "error", message: "Sesión expirada o inválida", status: 400 };
    }

    const res = await fetch(`${deps.qvapayApiUrl}/auth/request-pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.email, password: session.password }),
    });

    const data = (await res.json()) as QvapayResponse;

    if (res.ok) {
      return { type: "sent", message: (data.message as string) || "PIN enviado correctamente" };
    }

    return {
      type: "error",
      message: data.message || "No se pudo enviar el PIN",
      status: (res.status === 401 ? 401 : res.status === 429 ? 429 : 400) as ContentfulStatusCode,
    };
  }

  return { login, verify2FA, requestPin };
}

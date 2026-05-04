import type { ContentfulStatusCode } from "hono/utils/http-status";
import { Hono } from "hono";
import { createQvapayAuth } from "../qvapay-auth";

export const api = new Hono<{ Bindings: CloudflareBindings }>();

api.post("/login", async (c) => {
  const { email, password, two_factor_code } = await c.req.json();
  if (!email || !password)
    return c.json({ error: "Email y contraseña requeridos" }, 400 as ContentfulStatusCode);

  const auth = createQvapayAuth({ kv: c.env["qvapay-sessions"], qvapayApiUrl: c.env.QVPAY_API });
  const result = await auth.login(email, password, two_factor_code);

  switch (result.type) {
    case "2fa-required":
      return c.json({
        requires2FA: true,
        has_otp: result.has_otp,
        sessionId: result.sessionId,
        notified: result.notified,
      });
    case "success":
      return c.json({ success: true, accessToken: result.accessToken, me: result.me });
    case "error":
      return c.json({ error: result.message }, result.status);
  }
});

api.post("/verify", async (c) => {
  const { sessionId, two_factor_code } = await c.req.json();
  if (!sessionId || !two_factor_code) {
    return c.json({ error: "sessionId y two_factor_code requeridos" }, 400 as ContentfulStatusCode);
  }

  const auth = createQvapayAuth({ kv: c.env["qvapay-sessions"], qvapayApiUrl: c.env.QVPAY_API });
  const result = await auth.verify2FA(sessionId, two_factor_code);

  switch (result.type) {
    case "success":
      return c.json({ success: true, accessToken: result.accessToken, me: result.me });
    case "error":
      return c.json({ error: result.message }, result.status);
  }
});

api.post("/request-pin", async (c) => {
  const { sessionId } = await c.req.json();
  if (!sessionId) {
    return c.json({ error: "sessionId requerido" }, 400 as ContentfulStatusCode);
  }

  const auth = createQvapayAuth({ kv: c.env["qvapay-sessions"], qvapayApiUrl: c.env.QVPAY_API });
  const result = await auth.requestPin(sessionId);

  switch (result.type) {
    case "sent":
      return c.json({ message: result.message });
    case "error":
      return c.json({ error: result.message }, result.status);
  }
});

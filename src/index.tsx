import { Hono } from "hono";
import { renderer } from "./renderer";
import { login } from "./routes/login";
import { help } from "./routes/help";
import { api } from "./routes/api";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(renderer);

app.route("/", login);
app.route("/help", help);
app.route("/api", api);

app.get("/health", (c) => c.json({ status: "ok" }));

export default app;

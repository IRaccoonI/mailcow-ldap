import * as dotenv from "dotenv";

dotenv.config();

import Koa from "koa";
import cors from "@koa/cors";
import helmet from "koa-helmet";
import json from "koa-json";
import logger from "koa-logger";
import koaBody from "koa-body";
import Router from "koa-router";
import { syncLdapWithMailcow } from "./lib/syncLdapWithMailcow";
import { getOTP } from "./lib/password";

syncLdapWithMailcow();
setInterval(syncLdapWithMailcow, 60 * 60 * 1000); // one hour

const app = new Koa();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(json());
app.use(logger());
app.use(koaBody());

const router = new Router();

router.post("/forceUpdate", async (ctx) => {
  if (ctx.get("token") !== process.env.KOA_TOKEN) {
    ctx.throw(401);
  }

  await syncLdapWithMailcow();

  ctx.body = "OK";
  ctx.status = 200;
});

console;

router.post("/otpUsers", (ctx) => {
  if (ctx.get("token") !== process.env.KOA_TOKEN) {
    console.log(ctx.get("token"), process.env.KOA_TOKEN);
    ctx.throw(401);
  }

  ctx.body = ctx.request.body.map(getOTP);
  ctx.status = 200;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(`0.0.0.0:${port}`, () => {
  console.log(`App listening on the port ${port}\n`);
});

import { Taxios } from "@simplesmiler/taxios";
import axios from "axios";
import { MailcowAPI } from "../../../types/MailcowAPI";
import { User } from "./mailcowLdap";
import { getOTP } from "../../password";

if (!process.env.EMAIL_DOMAIN) {
  console.error("EMAIL_DOMAIN isn't defined in environment");
}

export const mailcowClient = new Taxios<MailcowAPI>(
  axios.create({
    baseURL: "http://localhost",
    headers: {
      "X-API-Key": process.env.MAILCOW_API_KEY,
    },
  })
);

export type MailcowUser =
  MailcowAPI["routes"]["/api/v1/get/mailbox/all/{domain}"]["GET"]["response"][number];

export class Mailcow {
  public static async getAllUsers(user_domain?: string) {
    const domain = user_domain || process.env.EMAIL_DOMAIN;

    const users = await mailcowClient.$get("/api/v1/get/mailbox/all/{domain}", {
      params: { domain },
    });

    return Array.isArray(users) ? users : [];
  }

  public static addUser(user: User, user_domain?: string) {
    const domain = user_domain || process.env.EMAIL_DOMAIN;
    const username = user.email?.split("@")[0] || user.name;
    const password = getOTP(username);

    return mailcowClient.$post("/api/v1/add/mailbox", {
      active: true,
      domain,
      local_part: username,
      name: user.name,
      password,
      password2: password,
      quota: +process.env.MAILCOW_DEFAULT_QUOTA,
      force_pw_update: true,
      tls_enforce_in: true,
      tls_enforce_out: true,
      tags: [],
    });
  }

  public static makeUsersActive(users: string[]) {
    return mailcowClient.$post("/api/v1/edit/mailbox", {
      attr: { active: true },
      items: users,
    });
  }

  public static makeUsersInactive(users: string[]) {
    return mailcowClient.$post("/api/v1/edit/mailbox", {
      attr: { active: false },
      items: users,
    });
  }
}

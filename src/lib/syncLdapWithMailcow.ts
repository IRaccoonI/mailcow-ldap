import { Mailcow } from "./ldap/mailcow/mailcowClient";
import { MailcowLdap } from "./ldap/mailcow/mailcowLdap";

export async function syncLdapWithMailcow() {
  const diff = await MailcowLdap.getDiffUsers({
    excludeLdapNames: (process.env.EXCLUDE_LDAP_USERS || "").split(","),
  });

  await Promise.all([
    ...diff.usersToAdd.map((u) => Mailcow.addUser(u)),
    Mailcow.makeUsersActive(diff.usersToActivate.map((u) => u.email)),
    Mailcow.makeUsersInactive(diff.usersToDeactivate.map((u) => u.email)),
  ]);

  console.log("Ldap synced " + new Date().toISOString());
}

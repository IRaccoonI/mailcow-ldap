import { FormattedUser, getClient } from "./ldap";
import { Settings, UserSchema } from "./settings";

export const getDefaultClient = () =>
  getClient({ settings: Settings, userSchema: UserSchema });

export type ExternalUser = FormattedUser;

export interface SutUser {
  username?: string;
}

function ldapError(e) {
  console.error(`LDAP error: ${e}`);
  return new Error("Не удалось получить пользователя из LDAP подключения.");
}

export async function getAllUsers({
  exclude,
  groups,
}: { exclude?: SutUser[]; groups?: string[] } = {}) {
  try {
    const client = getDefaultClient();
    const users = await client
      .searchUsers()
      .then((users) => users.map(client.formatUser));

    if (exclude) {
      return users.filter(
        (user) => !exclude.find((excluded) => excluded.username === user.name)
      );
    }

    return users;
  } catch (e) {
    throw ldapError(e);
  }
}

import LdapAuth from "ldapauth-fork";
import { SearchOptions, createClient } from "ldapjs-promise";
import _ from "lodash";
import { Settings, UserSchema } from "./settings";

const REJECT_UNAUTHORIZED = false; // разрешаем self signed сертификаты

export const LDAP_EMPTY = "<unknown>";

export type LDAPUser = {
  dn: string;
  controls: any[];
  objectclass?: string[];
  [p: string]: string | string[] | undefined;
};

export interface FormattedUser {
  name: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface ClientParams {
  settings: typeof Settings;
  userSchema: typeof UserSchema;
}

export const getClient = ({ settings, userSchema }: ClientParams) => {
  const client = createClient({
    url: [settings.url],
    tlsOptions: {
      rejectUnauthorized: REJECT_UNAUTHORIZED,
    },
    reconnect: true,
  });

  const userSearchOptions: SearchOptions = {
    filter: userSchema.filter,
    scope: "sub",

    paged: true,
    sizeLimit: 10000, // @TODO: Возможно тут косяк, надо бы проверить на 10к+ юзерах

    attributes: [
      userSchema.userName,
      userSchema.distinguishedName,
      userSchema.displayName,
      userSchema.firstName,
      userSchema.lastName,
      userSchema.email,
      userSchema.membership,
      userSchema.id,
      userSchema.commonName,
      userSchema.disabledAccountAttribute,
    ].filter(Boolean),
  };

  /**
   * Авторизует запросы по LDAP
   */
  const bind = () => {
    // @NOTE: Вызываем bind, только если указаны креды для авторизации запросов по LDAP
    const shouldBind = settings.distinguishedName && settings.password;

    if (shouldBind) {
      return client.bind(settings.distinguishedName!, settings.password!);
    }

    return Promise.resolve();
  };

  /**
   * Запрос к LDAP за списком сущностей
   */
  const search = async (options?: SearchOptions) => {
    await bind();

    const results = await client.searchReturnAll(settings.baseDn, options);
    return results.entries;
  };

  const searchUsers = async (options?: SearchOptions): Promise<LDAPUser[]> => {
    const users = await search({ ...userSearchOptions, ...options });

    return users as any;
  };

  const readUserField = (target: LDAPUser, field: keyof LDAPUser) => {
    const value = target[field];

    if (value == null) {
      return LDAP_EMPTY; // @TODO: Решить, хорошая ли это идея... или заранее фильтровать людей, если не нашли поле
    }

    if (Array.isArray(value)) return value[0];

    return value;
  };

  const formatUser = (user: LDAPUser): FormattedUser => {
    return {
      name: readUserField(user, userSchema.userName),
      email: readUserField(user, userSchema.email),
      firstName: readUserField(user, userSchema.firstName),
      lastName: readUserField(user, userSchema.lastName),
    };
  };

  return {
    search,
    searchUsers,
    formatUser,
  };
};

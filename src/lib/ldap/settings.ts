if (!process.env.LDAP_SERVER || !process.env.LDAP_BASE_DN) {
  console.warn("LDAP интеграция не настроена");
}

// https://jira.web-bee.ru/browse/SUT-3036
// @FIXME: В будущем все эти переменные надо будет вынести в настройки LDAP интеграции
export const Settings = {
  /**
   * Path to users
   */
  baseDn: process.env.LDAP_BASE_DN || "cn=accounts,dc=web-bee,dc=loc",

  /**
   * Full path to user
   * @example "uid=some.usr,cn=users,cn=accounts,dc=web-bee,dc=loc"
   */
  distinguishedName: process.env.LDAP_BIND_NAME, // login

  password: process.env.LDAP_BIND_PASSWORD, // password

  /**
   * Ldap server url
   * @example "ldap://127.0.0.1:389"
   */
  url: process.env.LDAP_SERVER,
};

// @NOTE: Настройки маппинга полей из ldap в нужные нам (см. LDAP.md)
export const UserSchema = {
  userName: process.env.LDAP_USER_FIELDS_USER_NAME || "uid",
  distinguishedName: process.env.LDAP_USER_FIELDS_DN || "dn",
  displayName: process.env.LDAP_USER_FIELDS_DISPLAY_NAME || "displayName",
  firstName: process.env.LDAP_USER_FIELDS_FIRST_NAME || "givenName",
  lastName: process.env.LDAP_USER_FIELDS_LAST_NAME || "sn",
  email: process.env.LDAP_USER_FIELDS_EMAIL || "mail",
  membership: process.env.LDAP_USER_FIELDS_MEMBERSHIP || "memberOf",
  id: process.env.LDAP_USER_FIELDS_ID || "ipaUniqueID",
  commonName: process.env.LDAP_USER_FIELDS_COMMON_NAME || "cn",
  disabledAccountAttribute:
    process.env.LDAP_USER_FIELDS_DISABLED_ACCOUNT_ATTRIBUTE || "",
  disabledAccountValue: process.env.LDAP_USER_FIELDS_DISABLED_ACCOUNT_VALUE,
  filter: process.env.LDAP_USERS_FILTER || "(uid=*)",
  groupName: process.env.LDAP_SUT_GROUP_DN,
};

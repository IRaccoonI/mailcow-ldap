import { FormattedUser, LDAP_EMPTY } from "../ldap";
import { getAllUsers } from "../ldapClient";
import { Mailcow, MailcowUser } from "./mailcowClient";

export interface User {
  /**
   * login
   */
  username: string;
  /**
   * First and last name
   */
  name: string;
  /**
   * Email
   */
  email?: string;
}

export class MailcowLdap {
  static ldapFormatToUser(ldapUsr: FormattedUser): User {
    return {
      name: `${ldapUsr.firstName} ${ldapUsr.lastName}`,
      email: ldapUsr.email === LDAP_EMPTY ? undefined : ldapUsr.email,
      username: ldapUsr.name,
    };
  }

  static mailcowFormatToUser(cowUsr: MailcowUser): User {
    return {
      name: cowUsr.name,
      email: cowUsr.username,
      username: cowUsr.local_part,
    };
  }

  public static async getDiffUsers({
    excludeLdapNames,
    domain,
  }: {
    excludeLdapNames?: string[];
    domain?: string;
  } = {}) {
    const ldapUsers = (await getAllUsers()).filter(
      (u) => !excludeLdapNames.includes(u.name)
    );
    const ldapUserEmails = ldapUsers.map((u) => u.email);

    const mailcowUsers = await Mailcow.getAllUsers(domain);
    const mailcowUserEmails = mailcowUsers.map(({ username }) => username);

    const ldapUsersToAdd = ldapUsers.filter(
      (ldapUsr) =>
        ldapUsr.email === LDAP_EMPTY ||
        (ldapUsr.email.endsWith(`@${process.env.EMAIL_DOMAIN}`) &&
          !mailcowUserEmails.includes(ldapUsr.email))
    );

    const ldapUsersToActivate = ldapUsers.filter(
      (ldapUsr) =>
        ldapUsr.email.endsWith(`@${process.env.EMAIL_DOMAIN}`) &&
        mailcowUsers.some(
          (cowUsr) => ldapUsr.email === cowUsr.username && !cowUsr.active
        )
    );

    const mailcowUsersToDeactivate = mailcowUsers.filter(
      (cowUsr) => !ldapUserEmails.includes(cowUsr.username) && cowUsr.active
    );

    return {
      usersToAdd: ldapUsersToAdd.map(MailcowLdap.ldapFormatToUser),
      usersToActivate: ldapUsersToActivate.map(MailcowLdap.ldapFormatToUser),
      usersToDeactivate: mailcowUsersToDeactivate.map(
        MailcowLdap.mailcowFormatToUser
      ),
    };
  }
}

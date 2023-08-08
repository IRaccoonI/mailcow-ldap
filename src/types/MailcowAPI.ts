export namespace MailcowAPI {}

export interface MailcowAPI {
  version: "1";
  routes: {
    "/api/v1/add/mailbox": {
      POST: {
        body?: {
          /**
           * is mailbox active or not
           */
          active?: boolean;
          /**
           * domain name
           */
          domain?: string;
          /**
           * left part of email address
           */
          local_part?: string;
          /**
           * Full name of the mailbox user
           */
          name?: string;
          /**
           * mailbox password for confirmation
           */
          password2?: string;
          /**
           * mailbox password
           */
          password?: string;
          /**
           * mailbox quota
           */
          quota?: number;
          /**
           * forces the user to update its password on first login
           */
          force_pw_update?: boolean;
          /**
           * force inbound email tls encryption
           */
          tls_enforce_in?: boolean;
          /**
           * force oubound tmail tls encryption
           */
          tls_enforce_out?: boolean;
          tags?: string[];
        };
        response: {
          /**
           * contains request object
           */
          log?: unknown[];
          msg?: unknown[];
          type?: "success" | "danger" | "error";
        };
      };
    };
    "/api/v1/delete/mailbox": {
      POST: {
        /**
         * contains list of mailboxes you want to delete
         */
        body?: string[];
        response: {
          /**
           * contains request object
           */
          log?: unknown[];
          msg?: unknown[];
          type?: "success" | "danger" | "error";
        };
      };
    };
    "/api/v1/edit/mailbox": {
      POST: {
        body?: {
          attr?: {
            /**
             * is mailbox active or not
             */
            active?: boolean;
            /**
             * force user to change password on next login
             */
            force_pw_update?: boolean;
            /**
             * Full name of the mailbox user
             */
            name?: string;
            /**
             * new mailbox password for confirmation
             */
            password2?: string;
            /**
             * new mailbox password
             */
            password?: string;
            /**
             * mailbox quota
             */
            quota?: number;
            /**
             * list of allowed send from addresses
             */
            sender_acl?: {};
            /**
             * is access to SOGo webmail active or not
             */
            sogo_access?: boolean;
          };
          /**
           * contains list of mailboxes you want update
           */
          items?: {};
        };
        response: {
          /**
           * contains request object
           */
          log?: unknown[];
          msg?: unknown[];
          type?: "success" | "danger" | "error";
        };
      };
    };
    "/api/v1/get/mailbox/{id}": {
      GET: {
        params: {
          id: string;
        };
        query?: {
          tags?: string;
        };
        response: {
          active?: string;
          attributes?: {
            force_pw_update?: string;
            mailbox_format?: string;
            quarantine_notification?: string;
            sogo_access?: string;
            tls_enforce_in?: string;
            tls_enforce_out?: string;
          };
          domain?: string;
          is_relayed?: number;
          local_part?: string;
          max_new_quota?: number;
          messages?: number;
          name?: string;
          percent_class?: string;
          percent_in_use?: number;
          quota?: number;
          quota_used?: number;
          rl?: boolean;
          spam_aliases?: number;
          username?: string;
          tags?: string[];
        }[];
      };
    };
    "/api/v1/get/mailbox/all/{domain}": {
      GET: {
        params: {
          domain: string;
        };
        response: {
          active?: string;
          attributes?: {
            force_pw_update?: string;
            mailbox_format?: string;
            quarantine_notification?: string;
            sogo_access?: string;
            tls_enforce_in?: string;
            tls_enforce_out?: string;
          };
          domain?: string;
          is_relayed?: number;
          local_part?: string;
          max_new_quota?: number;
          messages?: number;
          name?: string;
          percent_class?: string;
          percent_in_use?: number;
          quota?: number;
          quota_used?: number;
          rl?: boolean;
          spam_aliases?: number;
          /**
           * Email
           */
          username?: string;
          tags?: string[];
        }[];
      };
    };
  };
}

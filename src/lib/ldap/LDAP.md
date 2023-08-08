# LDAP

[**LDAP**](https://ru.wikipedia.org/wiki/LDAP)

Это протокол для хранения и передачи древовидных структур данных с любым набором атрибутов (они же LDIF).

Обычно используется для пользователей/групп/ролей.

*FreeIPA, Active Directory, Crowd*, ещё миллион систем умеют предоставлять своих пользователей/группы в виде LDAP.

А дальше любая система (*Jira/Confluence/Bitbucket/Nexus/TestIt/СУТ*/ещё миллион систем) через LDAP забирают эти данные.

Текущая реализация проверялась на

- Active Directory
- FreeIPA

## Места применения

По факту используется только в двух местах

1) Получение списка пользователей из LDAP для последующего добавления их в систему. Вызывается при добавлении пользоватея по LDAP
2) Аутентификация пользователя по *username* и *password*. Вызывается при попытке аутентификации, если у найденного пользователя `user.type === 'ldap'`

Вся остальная работа с пользователями идёт на стороне нашей системы (табличка `users`)

## Интеграция

### Список пользователей/групп (search)

Через LDAP мы достаём информацию о пользователях, используя [*promise-обёртку*](https://www.npmjs.com/package/ldapjs-promise) над библиотекой [ldap.js](http://ldapjs.org/client.html).

Определение нужных атрибутов (`uid, dn, cn, displaName, sn, memberOf, givenName, mail`, etc.) определяется через настройку интеграции (сейчас это переменные среды вида `LDAP_*`)

Дальше мы достаём значения заданных атрибутов и преобразуем их в объекты вида

```typescript
export interface FormattedUser {
  name: string; // user.uid
  active: boolean; // user.nsaccountlock or user.userAccountControl
  email: string; // user.main
  firstName: string; // user.givenName
  lastName: string; // user.sn
}
```

### Аутентификация пользователя (bind)

Чтобы проверить, что пользователь может аутентифицироваться в нашей системе, мы пытаемся авторизоваться по `LDAP` с указанными *username* и *password*. Для аутентификации используется специальный LDAP-метод [**bind**](http://ldapjs.org/client.html#bind).

Мы используем *библитеку-обёртку* [ldapauth-fork](https://www.npmjs.com/package/ldapauth-fork) над `ldap.js`, т.к. она делает правильный **bind** запрос, к тому же кэширует результаты.

### Аутентификация админа

Обычно запросы к LDAP серверу требуют аутентификации.

Если указаны переменные `LDAP_BIND_NAME` и `LDAP_BIND_PASSWORD`, то перед search запросом вызывается метод **bind** с этими значениями.

### Настройка интеграции и базовые фильтры

Переменные среды для базовой настройки подключения

```
# LDAP connection url (обязательно)
LDAP_SERVER=ldaps://ipa.web-bee.loc

# Базовый домен, от которого всё ищется (обязательно)
LDAP_BASE_DN=cn=accounts,dc=web-bee,dc=loc

# Авторизация запросов (bind)
LDAP_BIND_NAME=uid=ivanov,cn=users,cn=accounts,dc=web-bee,dc=loc
LDAP_BIND_PASSWORD=password

# Фильтр пользователей
LDAP_USERS_FILTER=(uid=*)
# LDAP_USERS_FILTER=(&(uid=*)(memberOf=cn=las-users,cn=groups,cn=accounts,dc=web-bee,dc=loc))

# Имя группы проверки принадлежности пользователя системе (необязательно, тогда будут все)
LDAP_SUT_GROUP_DN=cn=las-users,cn=groups,cn=accounts,dc=web-bee,dc=loc
```

### Маппинг полей пользоваетелей/групп

Любое LDAP хранилище уникально, поэтому нужно обязательно объяснить системе, как трактовать получаемые атрибуты, как фильтровать сущности по типам, как определять принадлежность пользователя группе и т.д.

Но для конкретных реализаций набор атрибутов обычно фиксирован, например

- Active Directory - https://activedirectorypro.com/ad-ldap-field-mapping/
- FreeIPA - https://www.freeipa.org/page/FreeIPAv2:DS_Design_Summary
- ApacheDS
- ApacheDS15
- AppleOpenDirectory
- FedoraDS
- GenericLDAP
- NovelleDirectory
- OpenDS
- OpenLDAP (набор инструментов, смысл атрибутов не фиксирован)
- OpenLDAPRfc2307
- Rfc2307
- SunONE

LDAP позволяет хранить атрибуты любых названий, поэтому нужно смапить атрибуты полученных LDIF значений в понятные нам.

Сейчас для настройки маппинга атрибутов используются переменные среды. В будущем это будет отдельная настройка в админке СУТа.

Переменные среды

```
# ipa # https://www.freeipa.org/page/HowTos/LDAP_authentication_for_Atlassian_JIRA_using_FreeIPA (табличка внизу статьи)
LDAP_USER_FIELDS_USER_NAME=uid
LDAP_USER_FIELDS_DN=dn
LDAP_USER_FIELDS_DISPLAY_NAME=displayName
LDAP_USER_FIELDS_FIRST_NAME=givenName
LDAP_USER_FIELDS_LAST_NAME=sn
LDAP_USER_FIELDS_EMAIL=mail
LDAP_USER_FIELDS_MEMBERSHIP=memberOf
LDAP_USER_FIELDS_ID=ipaUniqueID
LDAP_USER_FIELDS_COMMON_NAME=cn
LDAP_USER_FIELDS_DISABLED_ACCOUNT_ATTRIBUTE=nsaccountlock
LDAP_USER_FIELDS_DISABLED_ACCOUNT_VALUE=TRUE

# ad # https://activedirectorypro.com/ad-ldap-field-mapping/
LDAP_USER_FIELDS_USER_NAME=uid
LDAP_USER_FIELDS_DN=dn
LDAP_USER_FIELDS_DISPLAY_NAME=cn
LDAP_USER_FIELDS_FIRST_NAME=givenName
LDAP_USER_FIELDS_LAST_NAME=sn
LDAP_USER_FIELDS_EMAIL=mail
LDAP_USER_FIELDS_MEMBERSHIP=memberof
LDAP_USER_FIELDS_ID=
LDAP_USER_FIELDS_COMMON_NAME=cn
LDAP_USER_FIELDS_DISABLED_ACCOUNT_ATTRIBUTE=userAccountControl
LDAP_USER_FIELDS_DISABLED_ACCOUNT_VALUE=2
```

### Пример LDAP данных (LDIF)

Active Directory (урезанный пример)

```ldif
dn: dc=wimpi,dc=net
objectclass: top
objectclass: domain
dc: wimpi

dn: ou=users,dc=wimpi,dc=net
ou: users
objectclass: organizationalUnit
objectclass: top

dn: uid=test,ou=users,dc=wimpi,dc=net
uid: test
objectcategory: User
cn: Test User
sn: test
memberof: admin
objectclass: top
objectclass: person
objectclass: inetOrgPerson
objectclass: simulatedMicrosoftSecurityPrincipal
samaccountname: test
userpassword: secret

dn: ou=roles,dc=wimpi,dc=net
ou: roles
objectclass: top
objectclass: organizationalUnit

dn: cn=admin,ou=roles,dc=wimpi,dc=net
member: uid=test,ou=users,dc=wimpi,dc=net
cn: admin
objectclass: top
objectclass: groupOfNames
```

### Примеры ответов (ldapjs)

Пользователи

#### FreeIPA (анонимный запрос)

```js
// анонимный запрос
const ipaAnon = {
  "dn": "uid=ivanov,cn=users,cn=accounts,dc=web-bee,dc=loc",
  "controls": [],
  "uid": "ivanov",
  "displayName": "Иван Иванов",
  "gecos": "Ivan Ivanov",
  "objectClass": [
    "top",
    "person",
    "organizationalperson",
    "inetorgperson",
    "inetuser",
    "posixaccount",
    "krbprincipalaux",
    "krbticketpolicyaux",
    "ipaobject",
    "ipasshuser",
    "ipaSshGroupOfPubKeys",
    "mepOriginEntry"
  ],
  "loginShell": "/bin/bash",
  "homeDirectory": "/home/ivanov",
  "uidNumber": "1548000148",
  "gidNumber": "1548000148",
  "cn": "Иван Иванов",
  "initials": "II",
  "sn": "Иванов",
  "givenName": "Иван",
  "title": "директор по персоналу"
}

// авторизованный запрос
const ipaAuth = {
  "dn": "uid=ivanov,cn=users,cn=accounts,dc=web-bee,dc=loc",
  "controls": [],
  "uid": "ivanov",
  "displayName": "Иван Иванов",
  "gecos": "Ivan Ivanov",
  "krbPrincipalName": "ivanov@WEB-BEE.LOC",
  "objectClass": [
    "top",
    "person",
    "organizationalperson",
    "inetorgperson",
    "inetuser",
    "posixaccount",
    "krbprincipalaux",
    "krbticketpolicyaux",
    "ipaobject",
    "ipasshuser",
    "ipaSshGroupOfPubKeys",
    "mepOriginEntry"
  ],
  "loginShell": "/bin/bash",
  "homeDirectory": "/home/ivanov",
  "mail": "ivanov@web-bee.ru",
  "krbCanonicalName": "ivanov@WEB-BEE.LOC",
  "ipaUniqueID": "712cfb8e-2cea-11ec-8723-000c2959a107",
  "uidNumber": "1548000148",
  "gidNumber": "1548000148",
  "krbPasswordExpiration": "20240101170228Z",
  "krbLastPwdChange": "20230110170228Z",
  "memberOf": [
    "cn=ipausers,cn=groups,cn=accounts,dc=web-bee,dc=loc",
    "cn=internal-members,cn=groups,cn=accounts,dc=web-bee,dc=loc",
    "cn=las-users,cn=groups,cn=accounts,dc=web-bee,dc=loc",
    "cn=wbsite-members,cn=groups,cn=accounts,dc=web-bee,dc=loc"
  ],
  "cn": "Иван Иванов",
  "initials": "II",
  "sn": "Иванов",
  "givenName": "Иван",
  "krbLastSuccessfulAuth": "20230120080057Z",
  "krbLastFailedAuth": "20220519162327Z",
  "krbLoginFailedCount": "0",
  "title": "директор по персоналу",
  // hidden by default
  "nsaccountlock":"TRUE", // FALSE
}
```

#### Active Directory

```js
// https://github.com/intoolswetrust/ldap-server
const ad1 = {
  "dn": "uid=jduke,ou=Users,dc=ldap,dc=example",
  "controls": [],
  "sn": "duke",
  "cn": "Java Duke",
  "objectclass": [
    "top",
    "person",
    "inetOrgPerson",
    "organizationalPerson"
  ],
  "userpassword": "theduke",
  "uid": "jduke",
  "userAccountControl": "2", // disabled user
}

// https://hub.docker.com/r/dwimberger/ldap-ad-it
const ad2 = {
  "dn": "uid=test,ou=users,dc=wimpi,dc=net",
  "controls": [],
  "samaccountname": "test",
  "memberof": "admin",
  "objectcategory": "User",
  "sn": "test",
  "cn": "Test User",
  "objectclass": [
    "simulatedMicrosoftSecurityPrincipal",
    "top",
    "person",
    "inetOrgPerson",
    "organizationalPerson"
  ],
  "userpassword": "secret",
  "uid": "test"
}
```

## Примеры настройки других систем, использующих LDAP

**TestIT**

https://docs.testit.software/admin-guide/nastroika-podklyuchenii/ad-ldap/polya-nastroek-podklyucheniya.html

**Atlassian (Jira/Bitbucket/Confluence)**

https://www.freeipa.org/page/HowTos/LDAP_authentication_for_Atlassian_JIRA_using_FreeIPA

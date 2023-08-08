## Старт

`npm run start`

or

`docker build -t mailcowLdap . && docker run -it -p 3000:3000 mailcowLdap`

## Переменные среди

#### Ldap фильтр, для нужных пользователей(тут можно добавить фильтр по группам)

`LDAP_USERS_FILTER=(&(uid=*)(!(nsAccountLock=true)))`

#### Ненужные пользователи

`EXCLUDE_LDAP_USERS=bind_admin,admin`

#### Ссылка на ldap

`LDAP_SERVER=ldap://addr:389`

#### Ldap login

`LDAP_BIND_NAME=uid=usrUid,cn=users,cn=accounts,dc=web-bee,dc=loc`

#### Ldap password

`LDAP_BIND_PASSWORD=pswd`

#### Ldap путь до пользователей

`LDAP_BASE_DN=cn=accounts,dc=web-bee,dc=loc`

#### Mailcow квота на каждую новую почту

`MAILCOW_DEFAULT_QUOTA=3072`

#### Mailcow api key

`MAILCOW_API_KEY = k-e-y`

#### Mailcow emails domain

`EMAIL_DOMAIN=web-bee.ru`

#### Соль для пароля

`PASSWORD_SALT=strongest`

#### Токен для API, пробрасывается в заголовках с ключом "Token", для запросов к серверу

`KOA_TOKEN=smth`

#### Тут понятно уже

`PORT=3000`

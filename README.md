# Авторизация

## Для авторизации с локальной машины нужно

### В Я Облаке создать Сервисную учетку (SA)

Консоль - вторая вкладка в горизонтальном меню

### Дать SA доступ к каталогу с БД

Дать SA роль ydb.editor в каталоге в котором создана YDB база (Детали https://cloud.yandex.ru/docs/ydb/security/)

*Как:* В меню слева на каталоге зайти в меню по троеточию / Права доступа

### Получить для нее ключ

https://cloud.yandex.ru/docs/iam/operations/iam-token/create-for-sa#via-cli

`yc iam key create --service-account-name <SA name> --output key.json`

### Взять connetion string БД в Консоли Облака

- Консоль Managed Service for YDB / Базы данных
- На страницы БД Соединение / Endpoint

### Запустить приложение, указав в командной строке connection string

`npm start -- --connection-string <YDB connection string>`

*Внимание:* Лишнии '--' в комаде нужны чтоб параметры были корректно переданы 

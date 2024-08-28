<img style=" width: 162px; mix-blend-mode: multiply;" src="https://mrd-bucket.s3.us-west-2.amazonaws.com/logo/mrd/mrd-logo2.png" alt="MRD">


------


## Descrição

A api foi criada usando o framework [NestJS](https://nestjs.com/), o [TypeORM](https://typeorm.io/) para gerenciar a conexão com o banco e fazer as operações e por fim o banco de dados usado foi o [MySQL](https://www.mysql.com/).

## Pré-requisitos

* Node v16.18.1
* Docker
* NPM


## Como rodar

```bash

# Instale as dependências
$ npm install --force

# Rode o servidor
$ npm run start:dev
```

## Env

Abaixo um exemplo do arquivo de váriaveis de ambientes e como deve ser preenchido
```bash

## DB REMOTE DEV
DB_PORT=
DB_HOST=
DB_USER=
DB_PASS=
DB_NAME=

# AWS S3
S3_USER=
S3_PASSWORD=
S3_REGION=
S3_BUCKET=

# AWS SES
SES_KEY=
SES_SECRET=
SES_REGION=

# MAIL
EMAIL_USER=
EMAIL_PASS=


#JWT
SECRET_KEY=

```


## Banco de dados

Na pasta shared existe 2 arquivos `medicalExam.sql` e o `medicine.sql` eles devem ser rodados no banco de dados que a API irá usar.

Assim que a aplicação se conectar ao banco de dados, todas as tabelas e relações serão criadas.

## Scripts

| Script      | Função |
| ----------- | ----------- |
| prebuild | Roda o pré build |
| build | Gera o build da aplicação na pasta dist |
| format | Formata o código
| start | Inicia o servidor de dev |
| start:dev | Inicia o servidor de dev no watch mode |
| start:debug | Inicia o servidor de dev com debug |
| start:prod | Roda o build de produção |
| lint | Roda o ESLint no projeto

## Swagger

A o swagger da aplicação se encontra no `/api` da url do backend. Exemplo: `http://localhost:3333/api`

## Infra

A API do MRD usa alguns serviços da AWS que são os seguintes:

* **S3 (Simple Storage Service)** - Para armazenar todas as logos de clínicas e PDF's.
* **SES (Simple Email Service)** - Usado para enviar email.
* **SNS (Simple Notification Service)** - Usado para enviar SMS, usa as mesmas credenciais do S3.
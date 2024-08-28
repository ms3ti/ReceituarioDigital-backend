FROM ubuntu:22.04 
# ATUALIZANDO REPOSITÓRIOS E S.O
RUN apt update 
RUN apt upgrade -y
# INSTALANDO NODEJS
RUN apt-get install curl zip -y 
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | /bin/bash - 
RUN apt-get install nodejs -y

WORKDIR /
COPY ./package.json ./
RUN npm install --force
COPY . .

RUN npm run build

CMD ["node", "./dist/main.js"]
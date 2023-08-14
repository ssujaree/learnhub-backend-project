FROM node:lastest

WORKDIR /app

COPY . .

RUN npm i 

ENV DATABASE_URL="postgresql://postgres:academy@localhost:5432/postgres?schema=public"
ENV PORT=8000
ENV AUTH_SECRET="authsecret"

RUN npx run build

#dist/..

CMD ["node", "dist/index.js"]

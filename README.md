# bites-identity-reconciliation-

Production link enpoint: https://bites-identity-reconciliation-production.up.railway.app/identify


Various Technologies used in the project
Express Js
TypeScript
Prisma (ORM)
Postgresql

Create .env file
env variable used:
DATABASE_URL = your postgresql database url


Instructions:
```
git clone https://github.com/Raviikumar001/bites-identity-reconciliation-.git

```
```
cd bites-identity-reconciliation-
```

```
npm install
```

```
npx prisma migrate dev --name init;   
```
Generate and run the Prisma migration to create the Contact table in your database:

```
npm run dev

```


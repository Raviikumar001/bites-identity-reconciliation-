# bites-identity-reconciliation-

Production link enpoint: https://bites-identity-reconciliation-production.up.railway.app/identify


Various Technologies used in the project
Express Js
TypeScript
Prisma (ORM)
Postgresql

env variable used:
DATABASE_URL = your postgresql database url


Instructions:
```
git clone 'repo name'

```
```
cd bites-identity-reconciliation-
```
```
npm install
```

```
npm run dev

```
Assumptons
If you seeing if a primary contact becmes a secondary contact, for the first time it recives request, it makes the it contact secondary, but gives response of the primary contact record, 
hit the api agiain with same request, you'll get the ideal response , with all secondary fields. 😌


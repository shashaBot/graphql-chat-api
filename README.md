## Realtime GraphQL Chat API
Realtime chat with upload file, url metadata enrichment and channel creation/update. Users are registered using email and password with forgot password and email verification enabled.

### Installation
1. Clone this repo.
2. `npm install` (yarn has some issues with GraphQL-Yoga, don't use it for installing GraphQL-Yoga).
3. `docker-compose up -d`. This will set up two containers with prisma and postgres services running.
4. `npm run prisma deploy`. You can check out the prisma database schema and query the database directly using GraphQL operations on `localhost:4466`. Connect to postgres service mapped to port `5433` on your host machine to see the underlying database.
5. Create `.env`. See `.env_example`.
6. Run server using `npm run start`. Go to `http://localhost:4000` to run GraphQL operations on the playground.

### API Documentation
You can see the GraphQL API documentation and the schema in the GraphQL playground itself by exploring the sections on the right edge of the screen.

![GraphQL Playground](https://raw.githubusercontent.com/shashaBot/graphql-chat-api/master/playground.png)
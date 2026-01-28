import openapi from "@elysiajs/openapi";
import { Elysia, t } from "elysia";
import { betterAuthPlugin, OpenAPI } from "@/http/plugins/better-auth";
import { auth } from "./auth";
import cors from "@elysiajs/cors";

const app = new Elysia()
  .use(cors())
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    }),
  )
  .use(betterAuthPlugin)
  .get("/", () => "Hello Elysia")
  .get(
    "/users/:id",
    async ({ params, user }) => {
      const userId = params.id;

      const authenticatedUserName = user.name;
      const authenticatedUserId = user.id;

      return { id: authenticatedUserId, name: authenticatedUserName };
    },
    {
      auth: true,
      // org: true,
      detail: {
        summary: "Find user by ID",
        tags: ["users"],
      },
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Object({
          id: t.String(),
          name: t.String(),
        }),
      },
    },
  )
  .listen(3333);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

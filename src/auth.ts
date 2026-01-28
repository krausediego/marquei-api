import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, organization } from "better-auth/plugins";
import Stripe from "stripe";
import { db } from "./database/client";
import { env } from "./env";

const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
});

export const auth = betterAuth({
  basePath: "/auth",
  baseURL: "http://localhost:5173",
  trustedOrigins: ["http://localhost:5173"],
  plugins: [
    openAPI(),
    organization({
      schema: {
        organization: {
          additionalFields: {
            description: { type: "string", required: true },
            state: { type: "string", required: true },
            city: { type: "string", required: true },
            district: { type: "string", required: true },
            street: { type: "string", required: true },
            phone: { type: "string", required: true, unique: true },
            number: { type: "number", required: true },
            location: { type: "json", required: true },
            complement: { type: "string", required: false },
            postalCode: { type: "string", required: false },
          },
        },
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,
      organization: {
        enabled: true,
      },
      subscription: {
        enabled: true,
        authorizeReference: async ({ user, session, referenceId, action }) => {
          const org = await db.query.members.findFirst({
            where(fields, { and, eq }) {
              return and(eq(fields.organizationId, referenceId), eq(fields.userId, user.id));
            },
          });

          return org?.role === "owner";
        },
        plans: [
          {
            name: "standard",
            priceId: "price_1Su03uAU7tDzPSpagM66FXmC",
            limits: {
              professionals: 3,
            },
            freeTrial: {
              days: 14,
            },
          },
          {
            name: "premium",
            priceId: "price_1Su04DAU7tDzPSpaa7MQFEjR",
            limits: {
              professionals: 6,
            },
            freeTrial: {
              days: 14,
            },
          },
          {
            name: "pro",
            priceId: "price_1Su04UAU7tDzPSpaX8vbzC1U",
            limits: {
              professionals: 12,
            },
            freeTrial: {
              days: 14,
            },
          },
        ],
      },
    }),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  advanced: {
    database: {
      generateId: false,
    },
    disableOriginCheck: true,
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    password: {
      hash: (password: string) => Bun.password.hash(password),
      verify: ({ password, hash }) => Bun.password.verify(password, hash),
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const membership = await db.query.members.findFirst({
            orderBy(fields, { asc }) {
              return asc(fields.createdAt);
            },
            where(fields, { eq }) {
              return eq(fields.userId, session.userId);
            },
          });

          if (!membership) {
            return { data: session };
          }

          return {
            data: {
              ...session,
              activeOrganizationId: membership.organizationId,
            },
          };
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});

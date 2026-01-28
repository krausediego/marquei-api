import { TypeCompiler } from "@sinclair/typebox/compiler";
import { t } from "elysia";

const envSchema = t.Object({
  DATABASE_URL: t.String({ format: "uri" }),
  STRIPE_SECRET_KEY: t.String(),
  STRIPE_PUBLISHABLE_KEY: t.String(),
  STRIPE_WEBHOOK_SECRET: t.String(),
  GOOGLE_CLIENT_ID: t.String(),
  GOOGLE_CLIENT_SECRET: t.String(),
});

const compiler = TypeCompiler.Compile(envSchema);

export const env = (() => {
  const rawEnv = {
    DATABASE_URL: Bun.env.DATABASE_URL,
    STRIPE_SECRET_KEY: Bun.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: Bun.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: Bun.env.STRIPE_WEBHOOK_SECRET,
    GOOGLE_CLIENT_ID: Bun.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: Bun.env.GOOGLE_CLIENT_SECRET,
  };

  const encodedEnv = compiler.Encode(rawEnv);

  if (!compiler.Check(encodedEnv)) {
    const errors = [...compiler.Errors(encodedEnv)];

    console.error("Environment validation failed:");

    for (const error of errors) {
      console.error(`  - ${error.path}: ${error.message}`);
    }

    process.exit(1);
  }

  return encodedEnv;
})();

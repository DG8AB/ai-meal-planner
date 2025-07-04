// SERVER-ONLY helper.  Never import from client components!
import { createHttpClient } from "edgedb"

/* ---------------------------------------------------------------------------
   EdgeDB client (HTTP) – always runs on the server side.
--------------------------------------------------------------------------- */
export const client = createHttpClient({
  instanceName: process.env.EDGEDB_INSTANCE,
  secretKey: process.env.EDGEDB_SECRET_KEY,
})

/* ---------------------------------------------------------------------------
   ensureSchema(): creates MealPlan & Preferences if missing.
   - Runs once per cold-start (cached in global).
   - Executes each CREATE individually (no multi-stmt transactions).
   - Completely idempotent and race-safe.
--------------------------------------------------------------------------- */
const g = globalThis as unknown as { __schemaReady?: Promise<void> }

export async function ensureSchema() {
  if (g.__schemaReady) return g.__schemaReady

  g.__schemaReady = (async () => {
    // Small helper
    const typeExists = async (name: string) =>
      await client.querySingle<boolean>(
        `
        SELECT exists(
          SELECT schema::ObjectType
          FILTER .name = <str>$name
        )
      `,
        { name },
      )

    /* ── CREATE TYPES IF THEY ARE ABSENT ─────────────────────────────── */
    /*------------------------------------------------------------------
      EdgeDB’s HTTP client refuses bare DDL unless the session flag is
      raised.  The setting is an ENUM (cfg::AllowBareDDL), **not** bool.
      Valid values:  cfg::AllowBareDDL.AlwaysAllow | NeverAllow | UnsafeAllow
    ------------------------------------------------------------------*/
    await client.execute("CONFIGURE SESSION SET allow_bare_ddl := cfg::AllowBareDDL.AlwaysAllow;")
    if (!(await typeExists("default::MealPlan"))) {
      await client
        .execute(`
          CREATE TYPE MealPlan {
            required property user_id    -> str { default := 'anonymous' };
            required property meal_plan  -> json;
            required property current    -> bool { default := false };
            required property week_of    -> datetime;
            property meal_times          -> json;
            required property created_at -> datetime { default := datetime_current() };
          };
        `)
        .catch((e) => console.warn("CREATE MealPlan – ignored (probably parallel lambda):", e.message ?? e))
    }

    if (!(await typeExists("default::Preferences"))) {
      await client
        .execute(`
          CREATE TYPE Preferences {
            required property user_id     -> str {
              default := 'anonymous';
              constraint exclusive;
            };
            required property preferences -> json;
            required property created_at  -> datetime { default := datetime_current() };
            required property updated_at  -> datetime { default := datetime_current() };
          };
        `)
        .catch((e) => console.warn("CREATE Preferences – ignored (probably parallel lambda):", e.message ?? e))
    }

    console.log("✅ EdgeDB schema verified / ready")
  })()

  return g.__schemaReady
}

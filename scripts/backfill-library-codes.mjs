import postgres from "postgres";

import {
  hashLibraryCode,
  libraryCodeForEmail,
} from "../lib/library-code-core.ts";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set.");

const client = postgres(databaseUrl, { prepare: false, max: 1 });

try {
  const buyers = await client`
    SELECT DISTINCT s.id, s.email
    FROM supporters s
    INNER JOIN orders o ON o.supporter_id = s.id
    WHERE o.status = 'paid'
  `;

  for (const buyer of buyers) {
    const hash = hashLibraryCode(libraryCodeForEmail(buyer.email));
    await client`
      UPDATE supporters
      SET library_code_hash = ${hash}
      WHERE id = ${buyer.id}
    `;
  }

  const [verification] = await client`
    SELECT count(*)::int AS missing
    FROM (
      SELECT DISTINCT s.id
      FROM supporters s
      INNER JOIN orders o ON o.supporter_id = s.id
      WHERE o.status = 'paid' AND s.library_code_hash IS NULL
    ) paid_buyers_without_codes
  `;
  if (verification.missing !== 0) {
    throw new Error(`${verification.missing} paid buyer(s) still have no code.`);
  }

  console.log(
    `Backfilled and verified ${buyers.length} paid buyer Library Code(s).`,
  );
} finally {
  await client.end({ timeout: 5 });
}

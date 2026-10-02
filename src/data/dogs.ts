import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "node:process";

export type Dog = {
  name: string;
  age: number;
  race: string;
  health: string;
  details: string;
};

export function dogSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

let dogsPromise: Promise<Dog[]> | undefined;

export function loadDogs(): Promise<Dog[]> {
  dogsPromise ??= fetchDogs();
  return dogsPromise;
}

async function fetchDogs(): Promise<Dog[]> {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    const missing = [
      ["CLOUDFLARE_ACCOUNT_ID", accountId],
      ["R2_ACCESS_KEY_ID", accessKeyId],
      ["R2_SECRET_ACCESS_KEY", secretAccessKey],
    ]
      .filter(([, value]) => !value)
      .map(([name]) => name);
    throw new Error(
      `Missing required R2 build variables: ${missing.join(", ")}`,
    );
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  const response = await client.send(
    new GetObjectCommand({ Bucket: "data", Key: "dogs.json" }),
  );
  const content = await response.Body?.transformToString();

  if (!content)
    throw new Error(
      "R2 object data/dogs.json is empty or has no response body.",
    );

  const dogs: unknown = JSON.parse(content);
  if (!Array.isArray(dogs))
    throw new Error("R2 object data/dogs.json must contain a JSON array.");
  return dogs as Dog[];
}

/** Prefer a natural title in the 50–60 character range used for this site. */
export function dogPageTitle(name: string, race: string): string {
  const options = [
    `${name} the ${race}: dog profile, health notes, and story`,
    `${name} the ${race}: health notes, age, and story`,
    `${name}: ${race} dog profile, health notes, and story`,
    `${name}, ${race}: dog profile, health notes, and story`,
    `${name} the ${race} dog: health notes and story`,
    `${name}: ${race} health notes, age, and daily story`,
    `${name}, ${race}: health, age, and story`,
  ];
  const inRange = options.find(
    (title) => title.length >= 50 && title.length <= 60,
  );
  return inRange ?? options[0];
}

/** Trim bios to the 130–155 character meta description range. */
export function metaDescription(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length >= 130 && normalized.length <= 155) return normalized;
  if (normalized.length < 130) return normalized;

  const window = normalized.slice(0, 155);
  const sentenceEnd = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("; "),
  );
  if (sentenceEnd >= 129) return window.slice(0, sentenceEnd + 1).trim();

  const space = window.lastIndexOf(" ");
  const cut = space >= 130 ? space : 152;
  return `${window.slice(0, cut).trimEnd()}…`;
}

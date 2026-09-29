// Uploads the signed release APK to RuStore as a new version and sends it
// for moderation. Publication stays manual: an approved version waits for a
// button in the console. The app itself has to exist in the console already,
// the API only adds versions to it.
//
// Needs RUSTORE_KEY_ID and RUSTORE_PRIVATE_KEY, and `npm run apk:release`
// done first.
//
// Usage: npx tsx scripts/rustore-publish.ts "What is new in this version"

import "dotenv/config";
import { readFile } from "node:fs/promises";
import { APP_PACKAGE } from "../src/server/constants.ts";
import {
  createRuStoreClient,
  parsePrivateKey,
} from "../src/server/rustore.ts";

const APK = "android/app/build/outputs/apk/release/app-release.apk";
const VERSIONS = `/v1/application/${APP_PACKAGE}/version`;

const whatsNew = process.argv[2];
const { RUSTORE_KEY_ID, RUSTORE_PRIVATE_KEY } = process.env;

if (!whatsNew || !RUSTORE_KEY_ID || !RUSTORE_PRIVATE_KEY) {
  console.error(
    'Usage: npx tsx scripts/rustore-publish.ts "What is new", ' +
      "with RUSTORE_KEY_ID and RUSTORE_PRIVATE_KEY set",
  );
  process.exit(1);
}

const api = createRuStoreClient({
  keyId: RUSTORE_KEY_ID,
  privateKey: parsePrivateKey(RUSTORE_PRIVATE_KEY),
});

// RuStore allows one draft per app. One left over from the console may hold
// hand-made edits, so it is not deleted from here.
const drafts = await api.request<{ content: { versionId: number }[] }>(
  `${VERSIONS}?versionStatuses=DRAFT`,
);
if (drafts.content.length > 0) {
  console.error(
    `Draft ${drafts.content[0].versionId} already exists. ` +
      "Send or delete it in the console first.",
  );
  process.exit(1);
}

const versionId = await api.request<number>(VERSIONS, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ whatsNew, publishType: "MANUAL" }),
});
console.log(`created draft ${versionId}`);

const form = new FormData();
form.append("file", new Blob([await readFile(APK)]), "app-release.apk");
await api.request(`${VERSIONS}/${versionId}/apk?isMainApk=true`, {
  method: "POST",
  body: form,
});
console.log(`uploaded ${APK}`);

await api.request(`${VERSIONS}/${versionId}/commit`, { method: "POST" });
console.log(
  `version ${versionId} sent for moderation, publish it in the console once approved`,
);

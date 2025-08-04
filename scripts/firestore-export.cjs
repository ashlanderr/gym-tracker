const admin = require("firebase-admin");
const fs = require("fs");

admin.initializeApp({
  credential: admin.credential.cert(require('./firestore-key.json')),
});

const db = admin.firestore();

function convertTimestamps(obj) {
  if (obj instanceof admin.firestore.Timestamp) {
    return obj.toDate().getTime();
  }

  if (obj instanceof Date) {
    return obj.getTime();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertTimestamps);
  }

  if (obj !== null && typeof obj === "object") {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = convertTimestamps(value);
    }
    return newObj;
  }

  return obj;
}

async function exportFirestore() {
  const collections = await db.listCollections();
  const result = {};

  for (const col of collections) {
    const snapshot = await col.get();
    const colData = {};

    snapshot.forEach((doc) => {
      colData[doc.id] = convertTimestamps(doc.data());
    });

    result[col.id] = colData;
  }

  fs.writeFileSync("./scripts/firestore-export.json", JSON.stringify(result, null, 2));
  console.log("Export completed!");
}

exportFirestore();

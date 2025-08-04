const Y = require('yjs');

const data = require('./firestore-export.json');
const { WebsocketProvider } = require("y-websocket");

function fixSetExercises() {
  const sets = data.sets;
  const performances = data.performances;

  for (const set of Object.values(sets)) {
    set.exercise = performances[set.performance]?.exercise;
  }
}

function convertUserData(collections) {
  const docs = new Map();

  for (const collection of collections) {
    for (const [entryId, entity] of Object.entries(data[collection])) {
      if (!entity.user) {
        console.error(`User not found: ${collection}, ${entryId}`);
        continue;
      }
      let doc = docs.get(entity.user);
      if (!doc) {
        doc = new Y.Doc();
        docs.set(entity.user, doc);
      }

      const entityMap = new Y.Map(Object.entries(entity));
      const docCollection = doc.getMap(collection);
      docCollection.set(entryId, entityMap);
    }
  }

  return docs;
}

function convertSharedData(collections) {
  const doc = new Y.Doc();

  for (const collection of collections) {
    for (const [entryId, entity] of Object.entries(data[collection])) {
      const entityMap = new Y.Map(Object.entries(entity));
      const docCollection = doc.getMap(collection);
      docCollection.set(entryId, entityMap);
    }
  }

  return doc;
}

async function saveDoc(doc, name) {
  const wsUrl = process.env.VITE_BACKEND_URL ?? "ws://127.0.0.1:1234";
  const wsProvider = new WebsocketProvider(wsUrl, name, doc, { WebSocketPolyfill: require('ws') });

  await new Promise(resolve => {
    wsProvider.on('sync', value => {
      if (value) resolve();
    })
  });

  console.log('synced', name);

  wsProvider.destroy();
}

fixSetExercises();

const userDocs = convertUserData(['workouts', 'performances', 'records', 'sets']);
const sharedDoc = convertSharedData(['exercises']);

(async () => {
  for (const [userId, userDoc] of userDocs.entries()) {
    await saveDoc(userDoc, `user/${userId}`);
  }
  await saveDoc(sharedDoc, 'shared');
  process.exit(0);
})();

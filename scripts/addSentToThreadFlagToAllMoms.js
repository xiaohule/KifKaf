var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const updateDoc = async (doc) => {
  //if (doc.data().sentToThread doesn't exist, set it to false
  if (doc.data().sentToThread === undefined) {
    await doc.ref.update({ sentToThread: false });
  }
};

//TODO:1 the below doesn't delete the user doc's subcollections if any
const moveUsersToNeedMap = async () => {
  // Fetch recently active users
  const listUsersResult = await admin.auth().listUsers(1000); // you can adjust the number
  const oldUsers = listUsersResult.users;
  const oldUserUIDs = oldUsers.map((user) => user.uid);

  // const oldUserUIDs = [
  //   "RA0n1j6ZwePwXz0pXE2osYacWO92",
  //   "cdKIPeLIWfNdafdNoEcxjC3PBWx1",
  // ];

  console.log("oldUserUIDs", oldUserUIDs);

  for (const uid of oldUserUIDs) {
    const userDocRef = admin.firestore().doc(`users/${uid}`);
    const momentsCollRef = userDocRef.collection("moments");

    // Fetch documents from the collection
    const momentsDocs = await momentsCollRef.get();
    // Iterate over documents
    momentsDocs.forEach(async (doc) => updateDoc(doc));

    console.log(
      `Successfully updated user with UID: ${uid} and last sign in date ${new Date(
        oldUsers.find((user) => user.uid === uid).metadata.lastSignInTime,
      )}`,
    );
  }
};

moveUsersToNeedMap()
  .then(() => {
    console.log("Done!");
  })
  .catch((error) => {
    console.error("In addSentToThreadFlagToAllMoms> error", error);
  });

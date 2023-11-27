var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const updateDoc = async (doc) => {
  // if (doc.id.endsWith("-raw")) {
  if (doc.data().needs === undefined || doc.data().needs?.oops) {
    // console.log("Updating doc:", doc.id, "with moment:", doc.data().text);

    // Update the document as needed
    const needsSatisAndImpData = doc.data().needsSatisAndImp || {};
    const needsData = {};

    Object.keys(needsSatisAndImpData).forEach((need) => {
      // console.log(
      //   "needsSatisAndImpData[need].length",
      //   needsSatisAndImpData[need].length,
      // );
      if (needsSatisAndImpData[need].length === 2) {
        needsData[need] = {
          satisfaction: needsSatisAndImpData[need][0],
          // dissatisfaction: 1 - needsSatisAndImpData[need][0],
          dissatisfaction: Number(
            (1 - needsSatisAndImpData[need][0]).toFixed(1),
          ),
          importance: needsSatisAndImpData[need][1],
        };
      } else if (needsSatisAndImpData[need].length === 3) {
        needsData[need] = {
          satisfaction: needsSatisAndImpData[need][0],
          dissatisfaction: needsSatisAndImpData[need][1],
          importance: needsSatisAndImpData[need][2],
        };
      } else if (need === "oops") {
        needsData["Oops"] = needsSatisAndImpData[need];
      }
    });

    // Update the document in Firestore
    await doc.ref.update({ needs: needsData });
  }
};

//TODO:1 the below doesn't delete the user doc's subcollections if any
const moveUsersToNeedMap = async () => {
  // Fetch recently active users
  const listUsersResult = await admin.auth().listUsers(1000); // you can adjust the number
  const oldUsers = listUsersResult.users;
  const oldUserUIDs = oldUsers.map((user) => user.uid);

  // const oldUserUIDs = [
  //   "CMCg6wIq5GRoG0a8PMAno7m8Hi42",
  //   // "KbeNnCHDbxePz9TzI7eVf9ZOzXi2",
  //   // "huEvsyzeEZSHoJBNFH2GkOPkBeD2",
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
    console.error("Error moving ExistingUsersToUpdatedDataModel:", error);
  });

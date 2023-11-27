var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const updateDoc = async (doc) => {
  if (doc.id.endsWith("-raw")) {
    console.log("Updating doc:", doc.id);

    // Update the document as needed
    const needsData = doc.data().needs || {};

    // console.log("needsData", needsData);

    Object.keys(needsData).forEach((need) => {
      if (needsData[need].dissatisfactionSum === undefined) {
        needsData[need].dissatisfactionSum =
          needsData[need].occurrenceCount - needsData[need].satisfactionSum;
      }
      if (needsData[need].dissatisfactionValue === undefined) {
        needsData[need].dissatisfactionValue =
          needsData[need].occurrenceCount !== 0
            ? needsData[need].dissatisfactionSum /
              needsData[need].occurrenceCount
            : 0;
      }
    });

    // Update the document in Firestore
    await doc.ref.update({ needs: needsData });
  }
};

//TODO:1 the below doesn't delete the user doc's subcollections if any
const moveUsersToNewDissatAggData = async () => {
  // Fetch recently active users
  const listUsersResult = await admin.auth().listUsers(1000);
  const oldUsers = listUsersResult.users;
  const oldUserUIDs = oldUsers.map((user) => user.uid);

  // const oldUserUIDs = [
  //   "huEvsyzeEZSHoJBNFH2GkOPkBeD2",
  //   "zGbcd17tYKUMPjBZtdc8Txk9zG32",
  // ];

  console.log("oldUserUIDs", oldUserUIDs);

  for (const uid of oldUserUIDs) {
    const userDocRef = admin.firestore().doc(`users/${uid}`);

    const aggregateYearlyCollRef = userDocRef.collection("aggregateYearly");
    // Fetch documents from the collection
    const aggregateYearlyDocs = await aggregateYearlyCollRef.get();
    // Iterate over documents
    aggregateYearlyDocs.forEach(async (doc) => updateDoc(doc));

    const aggregateMonthlyCollRef = userDocRef.collection("aggregateMonthly");
    // Fetch documents from the collection
    const aggregateMonthlyDocs = await aggregateMonthlyCollRef.get();
    // Iterate over documents
    aggregateMonthlyDocs.forEach(async (doc) => updateDoc(doc));

    console.log(`Successfully updated data model for user with UID: ${uid}`);
  }
};

moveUsersToNewDissatAggData()
  .then(() => {
    console.log("Done!");
  })
  .catch((error) => {
    console.error("Error moving ExistingUsersToUpdatedDataModel:", error);
  });

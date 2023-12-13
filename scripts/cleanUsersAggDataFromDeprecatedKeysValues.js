var admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

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
      // Remove deprecated keys if they exist
      [
        "importanceDisplayValue",
        "satisfactionImpactDisplayValue",
        "unsatisfactionImpactDisplayValue",
      ].forEach((key) => {
        if (needsData[need][key] !== undefined) {
          delete needsData[need][key];
        }
      });
    });

    // Update the document in Firestore
    await doc.ref.update({
      needs: needsData,
      maxImportanceValue: FieldValue.delete(),
    });
  }
};

//TODO:1 the below doesn't delete the user doc's subcollections if any
const moveUsersToNewDissatAggData = async () => {
  // Fetch recently active users
  const listUsersResult = await admin.auth().listUsers(1000);
  const oldUsers = listUsersResult.users;
  const oldUserUIDs = oldUsers.map((user) => user.uid);

  // const oldUserUIDs = [
  //   "GsN1YDGfPST47a1M95kd6coskyp1", //tkuovftu@sharklasers.com
  //   "Xa4zGGZppmMNGKF5F2iQ9n2BNk22", //vwxaijtt@sharklasers.com
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

    console.log(
      `Successfully updated user with UID: ${uid} and last sign in date ${new Date(
        oldUsers.find((user) => user.uid === uid).metadata.lastSignInTime,
      )}`,
    );
  }
};

moveUsersToNewDissatAggData()
  .then(() => {
    console.log("Done!");
  })
  .catch((error) => {
    console.error("Error moving ExistingUsersToUpdatedDataModel:", error);
  });

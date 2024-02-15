var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//TODO:1 the below doesn't delete the user doc's subcollections if any
const seedUsersMomentsCounts = async () => {
  // Fetch recently active users
  const listUsersResult = await admin.auth().listUsers(1000); // you can adjust the number
  const oldUsers = listUsersResult.users;
  // const oldUserUIDs = oldUsers.map((user) => user.uid);

  const oldUserUIDs = [
    "pX3Bqo8fxRPARqf9k4cSILrfSK22", //ywybbmls@sharklasers.com
    "flfyfzaxSfUP4AaiDSLlkgdOmVI3", //emlk@yopmail.com
    "FMX7yIT8EGVnjgwe3VvhydhOIdq2", //egmdukwg@sharklasers.com deleted 10-12-2022 and one of 6-12-2023
  ];

  console.log("oldUserUIDs", oldUserUIDs);

  for (const uid of oldUserUIDs) {
    const userDocRef = admin.firestore().doc(`users/${uid}`);
    const momentsCollRef = userDocRef.collection("moments");

    // Fetch documents from the collection
    const momentsDocs = await momentsCollRef.get();
    console.log(
      // "momentsDocs",
      // momentsDocs,
      " momentsDocs.size",
      momentsDocs.size,
    );

    let momentsCount = 0;
    let momentsWithNeedsCount = 0;
    let momentsDeletedCount = 0;

    // Iterate over documents
    momentsDocs.forEach((doc) => {
      if (!doc.data().deleted) {
        momentsCount++;
        if (
          !doc.data().needs ||
          Object.keys(doc.data().needs).length === 0 ||
          doc.data().needs.Oops ||
          doc.data().needs.error
        )
          return;
        else momentsWithNeedsCount++;
      } else momentsDeletedCount++;
    });

    // Update the user doc in Firestore
    await userDocRef.update({
      momentsCount,
      momentsWithNeedsCount,
      momentsDeletedCount,
    });

    console.log(
      `Successfully updated user with UID: ${uid} and last sign in date ${new Date(
        oldUsers.find((user) => user.uid === uid).metadata.lastSignInTime,
      )}`,
    );
  }
};

seedUsersMomentsCounts()
  .then(() => {
    console.log("Done!");
  })
  .catch((error) => {
    console.error("Error moving ExistingUsersToUpdatedDataModel:", error);
  });

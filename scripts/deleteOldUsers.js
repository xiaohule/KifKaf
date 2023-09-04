var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//TODO:2 the below doesn't delete the user doc's subcollections if any
const deleteOldUsers = async () => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  // Fetch recently active users
  const listUsersResult = await admin.auth().listUsers(1000); // you can adjust the number
  const oldUsers = listUsersResult.users.filter(
    (user) => new Date(user.metadata.lastSignInTime) < oneMonthAgo,
  );

  const oldUserUIDs = oldUsers.map((user) => user.uid);
  // const oldUserUIDs = [
  //   "IN0UpMBOYTTMYG7S52tQlaTob8B3",
  //   "YajhznggV3TUnc40qboQxMi8eJy1",
  // ];

  for (const uid of oldUserUIDs) {
    await admin.auth().deleteUser(uid);
    const userDoc = admin.firestore().doc(`users/${uid}`);
    await userDoc.delete();
    console.log(
      `Successfully deleted user with UID: ${uid} and last sign in date ${new Date(
        oldUsers.find((user) => user.uid === uid).metadata.lastSignInTime,
      )}`,
    );
  }
};

deleteOldUsers()
  .then(() => {
    console.log("Done!");
  })
  .catch((error) => {
    console.error("Error deleting old users:", error);
  });

// const listAllUsers = (nextPageToken) => {
//   // List batch of users, 1000 at a time.
//   getAuth()
//     .listUsers(1000, nextPageToken)
//     .then((listUsersResult) => {
//       listUsersResult.users.forEach((userRecord) => {
//         console.log('user', userRecord.toJSON());
//       });
//       if (listUsersResult.pageToken) {
//         // List next batch of users.
//         listAllUsers(listUsersResult.pageToken);
//       }
//     })
//     .catch((error) => {
//       console.log('Error listing users:', error);
//     });
// };
// // Start listing users from the beginning, 1000 at a time.
// listAllUsers();

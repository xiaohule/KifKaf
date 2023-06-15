import { defineStore } from "pinia";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import {
  useCollection,
  useDocument,
  getCurrentUser,
  updateCurrentUserProfile,
} from "vuefire";
import { db } from "../boot/firebaseBoot.js";
import { ref, computed } from "vue";
import { date } from "quasar";
import {
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { set } from "firebase/database";
// destructuring to keep only what is needed in date
const { formatDate } = date;

export const useMomentsStore = defineStore("moments", () => {
  const user = ref(null);
  const userDocRef = ref(null);
  const userDoc = ref(null);
  const momentsCollRef = ref(null);
  const momentsColl = ref([]);
  const tagsCollRef = ref(null);
  const tagsColl = ref({});
  const initialized = ref(false);
  const isEditorFocused = ref(false);

  //TODO: separate betw local state and firestore?
  const fetchMoments = async () => {
    try {
      user.value = await getCurrentUser();
      // console.log("User accessed from moments store", user.value);
      userDocRef.value = doc(db, "users", `${user.value.uid}`);
      userDoc.value = useDocument(userDocRef);
      momentsCollRef.value = collection(db, `users/${user.value.uid}/moments`);
      momentsColl.value = useCollection(momentsCollRef);
      tagsCollRef.value = collection(db, `users/${user.value.uid}/tags`);
      tagsColl.value = useCollection(tagsCollRef);
      initialized.value = true;
    } catch (error) {
      console.log("Could not get  current user", error);
    }
  };

  const addMoment = async (moment) => {
    try {
      //SCRIPT ONE-SHOT 1 do catch up on tagsColl
      // const tagsCollInit = {};
      // momentsColl.value.data.forEach((mom) => {
      //   const intensity = mom.intensity;
      //   const tags = mom.tags;
      //   // Update tagStats.
      //   tags.forEach((tag) => {
      //     if (!tagsCollInit[tag]) {
      //       tagsCollInit[tag] = { count: 0, totalIntensity: 0, tagMoments: [] };
      //     }
      //     tagsCollInit[tag].count += 1;
      //     tagsCollInit[tag].totalIntensity += intensity;
      //     tagsCollInit[tag].tagMoments.push(mom.id);
      //   });
      // });
      // // Write tagStats to Firestore.
      // for (const tag in tagsCollInit) {
      //   await setDoc(
      //     doc(db, `users/${user.value.uid}/tags`, tag),
      //     tagsCollInit[tag]
      //   );
      //   // await tagsColl.value.set(tagsCollInit[tag]);
      // }

      //SCRIPT ONE-SHOT 2 do catch up on tagsColl
      // let userData = {};
      // userData.sumTotalPosPoints = 0;
      // userData.sumTotalNegPoints = 0;
      // // tagsColl.value.data.forEach(async (tag) => {
      // for (let tag of tagsColl.value.data) {
      //   const tagDocRef2 = doc(db, `users/${user.value.uid}/tags`, tag.id);
      //   const tagDoc2 = await getDoc(tagDocRef2);
      //   // console.log("tagDoc2", tagDoc2.id, tagDoc2.data());
      //   let tagData2 = {};
      //   if (tagDoc2.exists()) {
      //     tagData2.totalPosPoints = 0;
      //     tagData2.totalNegPoints = 0;
      //     // tagDoc2.data().tagMoments.forEach(async (momentId) => {
      //     for (const momentId of tagDoc2.data().tagMoments) {
      //       const momDocRef = doc(
      //         db,
      //         `users/${user.value.uid}/moments`,
      //         momentId
      //       );
      //       const mom = await getDoc(momDocRef);
      //       // console.log("mom", mom.id, mom.data());
      //       // console.log("mom intensity", mom.data().intensity);
      //       tagData2.totalPosPoints +=
      //         mom.data().intensity > 0 ? mom.data().intensity : 0;
      //       tagData2.totalNegPoints +=
      //         mom.data().intensity < 0 ? mom.data().intensity : 0;
      //       // console.log("tagData2Iteration", tagData2);
      //       // });
      //     }
      //     // console.log("tagDataPostUpdate", tagData2);
      //     await updateDoc(tagDocRef2, tagData2);
      //     userData.sumTotalPosPoints += tagData2.totalPosPoints;
      //     userData.sumTotalNegPoints += tagData2.totalNegPoints;
      //     console.log("userData", userData);
      //   }
      //   // });
      // }

      // console.log("userDataOUT", userData);
      // console.log("userDocRef", userDocRef.value);
      // await setDoc(userDocRef.value, userData);

      // console.log("moment", moment);
      // console.log("momentsCollRef", momentsCollRef);

      //////////

      // Add the new moment
      const docRef = await addDoc(momentsCollRef.value, moment);
      // Update the tag statistics for the new moment only
      moment.tags.forEach(async (tag) => {
        const tagDocRef = doc(db, `users/${user.value.uid}/tags`, tag);
        const tagDoc = await getDoc(tagDocRef);
        let tagData;
        if (tagDoc.exists()) {
          tagData = tagDoc.data();
          tagData.count += 1;
          tagData.totalIntensity += moment.intensity;
          tagData.totalPosPoints += moment.intensity > 0 ? moment.intensity : 0;
          tagData.totalNegPoints += moment.intensity < 0 ? moment.intensity : 0;
          tagData.tagMoments.push(docRef.id);
          await updateDoc(tagDocRef, tagData);
        } else {
          tagData = {
            count: 1,
            totalIntensity: moment.intensity,
            totalPosPoints: moment.intensity > 0 ? moment.intensity : 0,
            totalNegPoints: moment.intensity < 0 ? moment.intensity : 0,
            tagMoments: [docRef.id],
          };
          await setDoc(tagDocRef, tagData);
        }
        let userDocData = {
          sumTotalPosPoints: userDoc.value.data.sumTotalPosPoints,
          sumTotalNegPoints: userDoc.value.data.sumTotalNegPoints,
        };
        userDocData.sumTotalPosPoints += tagData.totalPosPoints;
        userDocData.sumTotalNegPoints += tagData.totalNegPoints;
        await updateDoc(userDocRef.value, userDocData);
      });
    } catch (error) {
      console.log(error);
    }
  };
  // async updateMoment(momentId, moment) {
  //   try {
  //     const momentRef = doc(db, `users/${this.userId}/moments/${momentId}`);
  //     await updateDoc(momentRef, moment);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // },
  // async deleteMoment(momentId) {
  //   try {
  //     const momentRef = doc(db, `users/${this.userId}/moments/${momentId}`);
  //     await deleteDoc(momentRef);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // },
  // define other actions like addMoment, updateMoment etc.

  //TODO: improve perf
  const uniqueDays = computed(() => {
    if (
      !momentsColl.value ||
      !momentsColl.value.data ||
      momentsColl.value.data.length === 0
    )
      return [];

    const days = momentsColl.value.data.map((moment) => {
      // Convert Firestore Timestamp to JavaScript Date
      // console.log("moment_i", moment.text + " - " + moment.date);
      // FORMAT moment.date is like {seconds: 1678296892, nanoseconds: 210000000}
      const ts = new Timestamp(moment.date.seconds, moment.date.nanoseconds);
      // const date = Date(moment.date.seconds);
      const date = ts.toDate();
      // Remove time
      date.setHours(0, 0, 0, 0);
      // console.log("moment_i.getTime", date.getTime());
      // FORMAT date.getTime() is like 1678230000000
      return date.getTime();
    });
    //Make an array of unique dates
    const uniqueDaysTemp = [...new Set(days)];
    //Sort the array in descending order
    uniqueDaysTemp.sort((a, b) => b - a);
    // console.log("uniqueDaysTemp", uniqueDaysTemp);
    // Convert to formatted Date objects
    return uniqueDaysTemp.map((day) => date.formatDate(day, "MMMM D, YYYY"));
  });

  const setIsEditorFocused = (isFocused) => {
    isEditorFocused.value = isFocused;
    console.log("isEditorFocused set to", isEditorFocused.value);
  };

  const uniqueTags = computed(() => {
    if (
      !tagsColl.value ||
      !tagsColl.value.data ||
      tagsColl.value.data.length === 0
    )
      return [];

    return tagsColl.value.data.map((doc) => doc.id);
  });

  const avgIntensitySortedTags = computed(() => {
    if (
      !tagsColl.value ||
      !tagsColl.value.data ||
      tagsColl.value.data.length === 0
    )
      return [];

    let tagsWithAverageIntensity = tagsColl.value.data.map((tagDoc) => {
      console.log("tagDocBefore", tagDoc);
      console.log(
        "userDoc.value.data.totalPosPoints",
        userDoc.value.data.sumTotalPosPoints
      );
      console.log("tagDoc.totalPosPoints", tagDoc.totalPosPoints);
      return {
        id: tagDoc.id,
        count: tagDoc.count,
        avgIntensity: tagDoc.totalIntensity / tagDoc.count,
        posPointsShare:
          tagDoc.totalPosPoints / userDoc.value.data.sumTotalPosPoints,
        negPointsShare:
          -1 * (tagDoc.totalNegPoints / userDoc.value.data.sumTotalNegPoints),
      };
    });
    return tagsWithAverageIntensity.sort(
      (a, b) => b.avgIntensity - a.avgIntensity
    );
  });

  const pointsShareSortedTags = computed(() => {
    if (
      !avgIntensitySortedTags.value ||
      avgIntensitySortedTags.value.length === 0
    )
      return [];

    return avgIntensitySortedTags.value
      .slice()
      .sort((a, b) => b.posPointsShare - a.posPointsShare);
  });

  const updateUser = async (changes) => {
    try {
      if (changes.displayName) {
        await updateCurrentUserProfile({
          displayName: changes.displayName,
        });
        console.log("displayName updated!");
      }

      if (changes.email || changes.password) {
        const cred = EmailAuthProvider.credential(
          user.value.email,
          changes.oldPassword
        );
        await reauthenticateWithCredential(user.value, cred);
        if (changes.email) {
          await updateEmail(user.value, changes.email);
          console.log("email updated!");
        } else if (changes.password) {
          await updatePassword(user.value, changes.password);
          console.log("password updated!");
        }
      }
    } catch (error) {
      console.log("Error occurred:", error);
      throw error; // throw the error
    }
  };

  return {
    user,
    momentsColl,
    userDoc,
    isEditorFocused,
    uniqueTags,
    avgIntensitySortedTags,
    pointsShareSortedTags,
    uniqueDays,
    addMoment,
    fetchMoments,
    updateUser,
    setIsEditorFocused,
  };
});

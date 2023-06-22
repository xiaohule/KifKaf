import { defineStore } from "pinia";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  Timestamp,
  increment,
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
// import { set } from "firebase/database";
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
      userDocRef.value = doc(db, "users", `${user.value.uid}`);
      userDoc.value = useDocument(userDocRef);

      // Check if user doc exists, if not create & initialize it
      const userDocCheck = await getDoc(userDocRef.value);
      if (!userDocCheck.exists()) {
        console.log("User doc does not exist, creating it");
        await setDoc(userDocRef.value, {
          momentsCount: 0,
          sumTotalPosPoints: 0,
          sumTotalNegPoints: 0,
        });
      }

      momentsCollRef.value = collection(db, `users/${user.value.uid}/moments`);
      momentsColl.value = useCollection(momentsCollRef);
      tagsCollRef.value = collection(db, `users/${user.value.uid}/tags`);
      tagsColl.value = useCollection(tagsCollRef);
      initialized.value = true;
    } catch (error) {
      console.log("Could not get current user", error);
    }
  };

  const addMoment = async (moment) => {
    //TODO: make this an atomic transaction https://firebase.google.com/docs/firestore/manage-data/transactions#transactions?
    try {
      // Add the new moment to momentsColl
      const docRef = await addDoc(momentsCollRef.value, moment);
      console.log("BEFORE1.1 moment.text: ", moment.text);
      console.log("BEFORE1.2 moment.tags: ", moment.tags);
      // Update the user statistics in userDoc
      await updateDoc(userDocRef.value, {
        momentsCount: increment(1),
        sumTotalPosPoints: increment(
          moment.intensity > 0 ? moment.intensity : 0
        ),
        sumTotalNegPoints: increment(
          moment.intensity < 0 ? moment.intensity : 0
        ),
      });
      console.log("BEFORE2.1 moment.text: ", moment.text);
      console.log("BEFORE2.2 moment.tags: ", moment.tags);

      // Update the tag statistics in tagsColl for the tags of the new moment if any
      moment.tags.forEach(async (tag) => {
        console.log("STARTING loop for tag: ", tag);
        const tagDocRef = doc(db, `users/${user.value.uid}/tags`, tag);
        const tagDoc = await getDoc(tagDocRef);
        let tagData;
        console.log("CONTINUING loop let see if tagDoc exist for tag: ", tag);
        if (tagDoc.exists()) {
          console.log("GOOD Yes apparently tagDoc does exist for tag: ", tag);
          tagData = tagDoc.data();
          tagData.count += 1;
          tagData.totalIntensity += moment.intensity;
          tagData.totalPosPoints += moment.intensity > 0 ? moment.intensity : 0;
          tagData.totalNegPoints += moment.intensity < 0 ? moment.intensity : 0;
          tagData.tagMoments.push(docRef.id);
          await updateDoc(tagDocRef, tagData);
          console.log("FINISHING loop tagDoc for tag: ", tag, "updated!");
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
    // console.log("isEditorFocused set to", isEditorFocused.value);
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
      // console.log("tagDocBefore", tagDoc);
      // console.log(
      //   "userDoc.value.data.totalPosPoints",
      //   userDoc.value.data.sumTotalPosPoints
      // );
      // console.log("tagDoc.totalPosPoints", tagDoc.totalPosPoints);
      return {
        id: tagDoc.id,
        count: tagDoc.count,
        avgIntensity:
          tagDoc.count != 0 ? tagDoc.totalIntensity / tagDoc.count : 0,
        percentShare:
          userDoc.value.data.momentsCount != 0
            ? tagDoc.count / userDoc.value.data.momentsCount
            : 0,
        posPointsShare:
          userDoc.value.data.sumTotalPosPoints != 0
            ? tagDoc.totalPosPoints / userDoc.value.data.sumTotalPosPoints
            : 0,
        negPointsShare:
          userDoc.value.data.sumTotalNegPoints != 0
            ? -1 *
              (tagDoc.totalNegPoints / userDoc.value.data.sumTotalNegPoints)
            : 0,
      };
    });
    return tagsWithAverageIntensity.sort(
      (a, b) => b.avgIntensity - a.avgIntensity
    );
  });

  const percentShareSortedTags = computed(() => {
    if (
      !avgIntensitySortedTags.value ||
      avgIntensitySortedTags.value.length === 0
    )
      return [];

    return avgIntensitySortedTags.value
      .slice()
      .sort((a, b) => b.percentShare - a.percentShare);
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
      throw error;
    }
  };

  return {
    user,
    momentsColl,
    isEditorFocused,
    uniqueTags,
    avgIntensitySortedTags,
    percentShareSortedTags,
    uniqueDays,
    addMoment,
    fetchMoments,
    updateUser,
    setIsEditorFocused,
  };
});

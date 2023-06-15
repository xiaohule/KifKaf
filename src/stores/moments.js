import { defineStore } from "pinia";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import {
  useCollection,
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
  const momentsRef = ref(null);
  const moments = ref([]);
  const tagsCollRef = ref(null);
  const tagsColl = ref({});
  const initialized = ref(false);
  const isEditorFocused = ref(false);

  //TODO: separate betw local state and firestore?
  const fetchMoments = async () => {
    try {
      user.value = await getCurrentUser();
      // console.log("User accessed from moments store", user.value);
      momentsRef.value = collection(db, `users/${user.value.uid}/moments`);
      tagsCollRef.value = collection(db, `users/${user.value.uid}/tags`);
      moments.value = useCollection(momentsRef);
      tagsColl.value = useCollection(tagsCollRef);
      initialized.value = true;
    } catch (error) {
      console.log("Could not get  current user", error);
    }
  };

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

  const uniqueTags = computed(() => {
    if (
      !tagsColl.value ||
      !tagsColl.value.data ||
      tagsColl.value.data.length === 0
    )
      return [];

    return tagsColl.value.data.map((doc) => doc.id);
  });

  //TODO: improve perf
  const uniqueDays = computed(() => {
    if (
      !moments.value ||
      !moments.value.data ||
      moments.value.data.length === 0
    )
      return [];

    const days = moments.value.data.map((moment) => {
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

  const addMoment = async (moment) => {
    try {
      //SCRIPT ONE-SHOT do catch up on tagsColl
      // const tagsCollInit = {};
      // moments.value.data.forEach((mom) => {
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

      // Add the new moment
      const docRef = await addDoc(momentsRef.value, moment);
      // Update the tag statistics for the new moment only
      moment.tags.forEach(async (tag) => {
        const tagDocRef = doc(db, `users/${user.value.uid}/tags`, tag);
        const tagDoc = await getDoc(tagDocRef);
        let tagData;

        if (tagDoc.exists()) {
          tagData = tagDoc.data();
          tagData.count += 1;
          tagData.totalIntensity += moment.intensity;
          tagData.tagMoments.push(docRef.id);
        } else {
          tagData = {
            count: 1,
            totalIntensity: moment.intensity,
            tagMoments: [docRef.id],
          };
        }
        await setDoc(tagDocRef, tagData);
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

  const getTagStats = (tag) => {
    if (tagStats.value[tag]) {
      const { count, totalIntensity } = tagStats.value[tag];
      return {
        count,
        averageIntensity: totalIntensity / count,
      };
    } else {
      return {
        count: 0,
        averageIntensity: 0,
      };
    }
  };

  const setIsEditorFocused = (isFocused) => {
    isEditorFocused.value = isFocused;
    console.log("isEditorFocused set to", isEditorFocused.value);
  };

  return {
    user,
    momentsRef,
    moments,
    isEditorFocused,
    uniqueTags,
    uniqueDays,
    addMoment,
    fetchMoments,
    updateUser,
    setIsEditorFocused,
    getTagStats,
  };
});

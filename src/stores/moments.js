import { defineStore } from "pinia";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  Timestamp,
  arrayUnion,
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
  // const userDoc = ref(null);
  const momentsCollRef = ref(null);
  const momentsColl = ref([]);
  const tagsCollRef = ref(null);
  const tagsColl = ref({});
  const initialized = ref(false);
  const isEditorFocused = ref(false);

  //TODO:2 separate betw local state and firestore?
  const fetchMoments = async () => {
    try {
      user.value = await getCurrentUser();
      userDocRef.value = doc(db, "users", `${user.value.uid}`);
      // userDoc.value = useDocument(userDocRef);

      // Check if user doc exists, if not create & initialize it
      const userDocCheck = await getDoc(userDocRef.value);
      if (!userDocCheck.exists()) {
        console.log("User doc does not exist, creating it");
        await setDoc(userDocRef.value, {
          momentsDates: [], //TODO:2 instead make it a list of {date, momentsCount} objects it will be faster to count for percentShare
          //2 here we can persevere user's da
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
    //TODO:2 make this an atomic transaction https://firebase.google.com/docs/firestore/manage-data/transactions#transactions?
    try {
      // Add the new moment to momentsColl
      const docRef = await addDoc(momentsCollRef.value, moment);
      // Update the tag statistics in tagsColl for the tags of the new moment if any
      moment.tags.forEach(async (tag) => {
        const tagDocRef = doc(db, `users/${user.value.uid}/tags`, tag);
        const tagDoc = await getDoc(tagDocRef);
        const tagData = {
          id: docRef.id,
          date: moment.date,
          intensity: moment.intensity,
          tags: moment.tags,
          text: moment.text,
        };
        if (tagDoc.exists())
          await updateDoc(tagDocRef, { tagMoments: arrayUnion(tagData) });
        else await setDoc(tagDocRef, { tagMoments: [tagData] });
      });

      // Update the user statistics in userDoc
      await updateDoc(userDocRef.value, {
        momentsDates: arrayUnion(moment.date),
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

  //TODO:1 improve perf
  const uniqueDays = computed(() => {
    if (
      !momentsColl.value ||
      !momentsColl.value.data ||
      momentsColl.value.data.length === 0
    )
      return [];

    const days = momentsColl.value.data.map((moment) => {
      // Convert Firestore Timestamp to JavaScript Date, format of moment.date is like {seconds: 1678296892, nanoseconds: 210000000}
      const ts = new Timestamp(moment.date.seconds, moment.date.nanoseconds);
      const date = ts.toDate();
      date.setHours(0, 0, 0, 0);
      // Format of date.getTime() is like 1678230000000
      return date.getTime();
    });
    //Make an array of unique dates
    const uniqueDaysTemp = [...new Set(days)];
    //Sort the array in descending order
    uniqueDaysTemp.sort((a, b) => b - a);
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

  //rewrite avgIntensitySortedTags as a method that takes a date range dateRange defined as /*const pickedDateRange = ref([new Date(new Date().getFullYear(), 0, 1), new Date()])*/ as a parameter
  const getTags = (
    dateRange,
    filterBy = "all",
    sortBy = "avgIntensity",
    descending = true
  ) => {
    return computed(() => {
      if (
        !tagsColl.value ||
        !tagsColl.value.data ||
        tagsColl.value.data.length === 0
      )
        return [];

      const momentsList = momentsColl.value.data.filter((moment) => {
        const ts = new Timestamp(moment.date.seconds, moment.date.nanoseconds);
        const date = ts.toDate();
        date.setHours(0, 0, 0, 0);
        return date >= dateRange[0] && date <= dateRange[1];
      });

      let tagList = tagsColl.value.data.map((tagDoc) => {
        if (tagDoc.tagMoments.length === 0) return;
        //return only the tagMoments that are within the date range
        const tagMomentsInRange = tagDoc.tagMoments.filter((tagMoment) => {
          const ts = new Timestamp(
            tagMoment.date.seconds,
            tagMoment.date.nanoseconds
          );
          const date = ts.toDate();
          date.setHours(0, 0, 0, 0);
          return date >= dateRange[0] && date <= dateRange[1];
        });
        //calculate the average intensity of the tagMoments in the date range
        const totalIntensity = tagMomentsInRange.reduce(
          (total, moment) => total + moment.intensity,
          0
        );

        //return the tagDoc with the average intensity
        return {
          id: tagDoc.id,
          count: tagMomentsInRange.length,
          avgIntensity:
            tagMomentsInRange.length != 0
              ? totalIntensity / tagMomentsInRange.length
              : 0,
          percentShare:
            momentsList.length != 0
              ? tagMomentsInRange.length / momentsList.length
              : 0,
        };
      });
      tagList = tagList.filter((tag) => tag.count > 0); //keep only the tags that have at least one moment
      if (filterBy === "positive")
        tagList = tagList.filter((tag) => tag.avgIntensity >= 0);
      else if (filterBy === "negative")
        tagList = tagList.filter((tag) => tag.avgIntensity < 0);

      //sort the array in descending or ascending order
      descending
        ? tagList.sort((a, b) => b[sortBy] - a[sortBy])
        : tagList.sort((a, b) => a[sortBy] - b[sortBy]);
      return tagList;
    });
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
      throw error;
    }
  };

  return {
    user,
    momentsColl,
    isEditorFocused,
    uniqueTags,
    uniqueDays,
    getTags,
    addMoment,
    fetchMoments,
    updateUser,
    setIsEditorFocused,
  };
});

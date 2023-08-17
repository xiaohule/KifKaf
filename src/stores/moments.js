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
  // useDocument,
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
import axios from "axios";
// destructuring to keep only what is needed in date
const { formatDate } = date;

export const useMomentsStore = defineStore("moments", () => {
  const user = ref(null);
  const userDocRef = ref(null);
  const momentsCollRef = ref(null);
  const momentsColl = ref([]);
  const tagsCollRef = ref(null);
  const tagsColl = ref({});
  const aggregateMonthlyCollRef = ref(null);
  const aggregateMonthlyColl = ref({});
  const aggregateYearlyCollRef = ref(null);
  const aggregateYearlyColl = ref({});
  const aggregateAllTimeCollRef = ref(null);
  const aggregateAllTimeColl = ref({});
  const initialized = ref(false);
  const isEditorFocused = ref(false);
  const needsList = [
    "Physical Safety",
    "Food",
    "Shelter",
    "Financial Security",
    "Rest & Relaxation",
    "Comfort",
    "Physical Movement",
    "Physical Touch",
    "Sexual Expression",
    "Contact with Nature",
    "Social Connection",
    "Belongingness & Community",
    "Empathy, Understanding & Validation",
    "Affection, Love & Intimacy",
    "Emotional Safety & Well-Being",
    "Personal Privacy",
    "Personal Autonomy",
    "Self-Esteem & Social Recognition",
    "Competence",
    "Efficiency",
    "Societal Contribution",
    "Personal Expression & Creativity",
    "Exploration",
    "Inspiration",
    "Learning",
    "Self-Actualization",
    "Challenge",
    "Novelty",
    "Entertainment",
    "Humor",
    "Play",
    "Moral Integrity",
    "Social Justice",
    "Order & Structure",
    "Altruism",
    "Life's Meaning & Purpose",
    "Joyful Celebration",
    "Grieving & Mourning",
    "Inner Peace",
    "Spiritual Transcendence",
  ];

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
        });
      }

      momentsCollRef.value = collection(db, `users/${user.value.uid}/moments`);
      momentsColl.value = useCollection(momentsCollRef);
      tagsCollRef.value = collection(db, `users/${user.value.uid}/tags`);
      tagsColl.value = useCollection(tagsCollRef);
      aggregateMonthlyCollRef.value = collection(
        db,
        `users/${user.value.uid}/aggregateMonthly`,
      );
      aggregateMonthlyColl.value = useCollection(aggregateMonthlyCollRef);
      aggregateYearlyCollRef.value = collection(
        db,
        `users/${user.value.uid}/aggregateYearly`,
      );
      aggregateYearlyColl.value = useCollection(aggregateYearlyCollRef);
      aggregateAllTimeCollRef.value = collection(
        db,
        `users/${user.value.uid}/aggregateAllTime`,
      );
      aggregateAllTimeColl.value = useCollection(aggregateAllTimeCollRef);

      initialized.value = true;
    } catch (error) {
      console.log("Error in fetchMoments", error);
    }
  };

  const addMoment = async (moment) => {
    //TODO:2 make this an atomic transaction https://firebase.google.com/docs/firestore/manage-data/transactions#transactions?
    //TODO: 3 make it so those various call are simultaneous and not sequential and so that mom can be created either here or in express
    try {
      // Add the new moment to momentsColl
      const docRef = await addDoc(momentsCollRef.value, moment);
      // Update the tag statistics in tagsColl for the tags of the new moment if any
      console.log("XXX in addMoment, moment:", moment);

      for (const tag of moment.tags) {
        console.log("XXX in for (const tag of moment.tags), tag:", tag);
        const tagDocRef = doc(db, `users/${user.value.uid}/tags`, tag);
        const tagDoc = await getDoc(tagDocRef);
        const tagData = {
          id: docRef.id,
          date: moment.date,
          intensity: moment.intensity,
          tags: moment.tags,
          text: moment.text,
        };
        // console.log("XXX in moment.tags.forEach, tagDocRef", tagDocRef);
        // console.log("XXX in moment.tags.forEach, tagDoc", tagDoc);
        // console.log("XXX in moment.tags.forEach, tagData", tagData);

        if (tagDoc.exists())
          await updateDoc(tagDocRef, { tagMoments: arrayUnion(tagData) });
        else await setDoc(tagDocRef, { tagMoments: [tagData] });
      }

      // Update the user statistics in userDoc
      await updateDoc(userDocRef.value, {
        momentsDates: arrayUnion(moment.date),
      });

      user.value
        .getIdToken(/* forceRefresh */ true)
        .then((idToken) => {
          // console.log("idToken", idToken);
          // Now, we use Axios to send the request with the token in the headers.
          return axios.get(`/api/learn/needs/${moment.text}`, {
            headers: {
              authorization: `Bearer ${idToken}`,
              momentdate: moment.date,
              momentid: docRef.id,
            },
          });
        })
        .then((response) => {
          console.log(
            "SUCCESSFUL LLM RESPONSE for moment '",
            moment.text,
            "' :",
            response.data,
          );
          //returns {'Physical Movement': 0.8, 'Self-Esteem & Social Recognition': 0.9, ...}
        })
        .catch((error) => {
          console.error(error);
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

  //TODO: 2 rewrite avgIntensitySortedTags as a method that takes a date range dateRange defined as /*const pickedDateRange = ref([new Date(new Date().getFullYear(), 0, 1), new Date()])*/ as a parameter
  const getTags = (
    dateRange,
    filterBy = "all",
    sortBy = "avgIntensity",
    descending = true,
  ) => {
    return computed(() => {
      if (
        !tagsColl.value ||
        !tagsColl.value.data ||
        tagsColl.value.data.length === 0
      ) {
        return [];
      }

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
            tagMoment.date.nanoseconds,
          );
          const date = ts.toDate();
          date.setHours(0, 0, 0, 0);
          return date >= dateRange[0] && date <= dateRange[1];
        });
        //calculate the average intensity of the tagMoments in the date range
        const totalIntensity = tagMomentsInRange.reduce(
          (total, moment) => total + moment.intensity,
          0,
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
          changes.oldPassword,
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
    needsList,
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

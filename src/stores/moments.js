import { defineStore } from "pinia";
import {
  collection,
  doc,
  // addDoc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  Timestamp,
  arrayUnion,
  writeBatch,
  query,
  where,
  orderBy,
  limit,
  increment,
  onSnapshot,
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
import axios from "axios";
// destructuring to keep only what is needed in date
const { formatDate } = date;

export const useMomentsStore = defineStore("moments", () => {
  const user = ref(null);
  const userDocRef = ref(null);
  const userDoc = ref(null);
  const momentsColl = ref([]);
  const tagsColl = ref([]);
  const aggregateData = ref({});
  const userFetched = ref(false);
  const momentsFetched = ref(false);
  const aggregateDataFetched = ref(false);
  const isEditorFocused = ref(false);
  const needsMap = {
    "Physical Safety": "🛡️",
    Food: "🥦",
    Shelter: "🏠",
    "Financial Security": "💰",
    "Rest & Relaxation": "🌙",
    Comfort: "🛋️",
    "Physical Movement": "🤸",
    "Physical Touch": "👐",
    "Sexual Expression": "💋",
    "Contact with Nature": "🏞️",
    "Social Connection": "👥",
    "Belongingness & Community": "🏘️",
    "Empathy, Understanding & Validation": "👂",
    "Affection, Love & Intimacy": "❤️",
    "Emotional Safety & Well-Being": "🤗",
    "Personal Privacy": "🚪",
    "Personal Autonomy": "🛤️",
    "Self-Esteem & Social Recognition": "💪",
    Competence: "🏆",
    Efficiency: "⚡",
    "Societal Contribution": "🔧",
    "Personal Expression & Creativity": "🎨",
    Exploration: "🌎",
    Inspiration: "💡",
    Learning: "📚",
    "Self-Actualization": "🌱",
    Challenge: "⛰️",
    Novelty: "🌀",
    Entertainment: "🎠",
    Humor: "😂",
    Play: "⚽",
    "Moral Integrity": "🕊️",
    "Social Justice": "⚖️",
    "Order & Structure": "📐",
    Altruism: "🤲",
    "Life's Meaning & Purpose": "🌌",
    "Joyful Celebration": "🎉",
    "Grieving & Mourning": "🥀",
    "Inner Peace": "🧘‍♂️",
    "Spiritual Transcendence": "🌸",
  };

  //TODO:2 separate betw local state and firestore so that directly after mom insertion the state is updated and only if fs save is failed is it reverted? I.e. "Optimistic UI Update with Revert" ?
  const fetchUser = async () => {
    try {
      if (userFetched.value) {
        console.log("In fetchUser, already userFetched");
        return;
      }

      user.value = await getCurrentUser();
      // Check if user exists and has a uid property
      if (!user.value || !user.value.uid) {
        console.log("Failed to fetch user or user.uid");
        return;
      }

      // Check if user doc exists, if not create & initialize it
      userDocRef.value = doc(db, "users", `${user.value.uid}`);
      const userDocCheck = await getDoc(userDocRef.value);
      if (!userDocCheck.exists()) {
        console.log("User doc does not exist, creating it");
        await setDoc(userDocRef.value, {
          momentsDays: [],
          hasNeeds: false,
        });
      }

      userDoc.value = useDocument(userDocRef);

      userFetched.value = true;
    } catch (error) {
      console.log("Error in fetchUser", error);
    }
  };

  const fetchMoments = async () => {
    try {
      if (momentsFetched.value) {
        console.log("In fetchMoments, already momentsFetched");
        return;
      }
      if (!userFetched.value) {
        console.log("User not yet fetched, fetching it");
        await fetchUser();
      }

      momentsColl.value = useCollection(
        collection(db, `users/${user.value.uid}/moments`),
      );
      tagsColl.value = useCollection(
        collection(db, `users/${user.value.uid}/tags`),
      );

      momentsFetched.value = true;
    } catch (error) {
      console.log("Error in fetchMoments", error);
    }
  };

  const fetchAggregateData = async () => {
    try {
      if (aggregateDataFetched.value) {
        console.log("In fetchAggregateData, already aggregateDataFetched");
        return;
      }
      if (!userFetched.value) {
        console.log("User not yet fetched, fetching it");
        await fetchUser();
      }

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear().toString();
      const currentYYYYdMM = `${currentYear}-${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      onSnapshot(
        doc(db, `users/${user.value.uid}/aggregateYearly/${currentYear}`),
        (doc) => {
          aggregateData.value[currentYear] = doc.data();
        },
      );

      onSnapshot(
        doc(db, `users/${user.value.uid}/aggregateMonthly/${currentYYYYdMM}`),
        (doc) => {
          aggregateData.value[currentYYYYdMM] = doc.data();
        },
      );

      //TODO:2 first try getDocsFromCache, if fails then getDocsFromServer
      getDocs(collection(db, `users/${user.value.uid}/aggregateYearly`)).then(
        (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            if (doc.id.length === 4 && doc.id !== currentYear) {
              aggregateData.value[doc.id] = doc.data();
              // needsAggregatePrevYears.value[doc.id] = ref(doc.data());
            }
          });
        },
      );

      getDocs(collection(db, `users/${user.value.uid}/aggregateMonthly`)).then(
        (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            if (doc.id.length === 7 && doc.id !== currentYYYYdMM) {
              aggregateData.value[doc.id] = doc.data();
            }
          });
        },
      );

      aggregateDataFetched.value = true;
      // console.log("In fetchAggregateData, aggregateData:", aggregateData);
      console.log(
        "In fetchAggregateData, aggregateData.value:",
        aggregateData.value,
      );
    } catch (error) {
      console.log("Error in fetchAggregateData", error);
    }
  };

  const hasNeeds = computed(() => {
    return userDoc?.value?.data?.hasNeeds ?? false;
  });

  //LLM CALL RETRIES: at each start of the app, look for up to 3 moments with empty needsImportances have not been rated and retry the LLM call
  const emptyNeedsMomentsRetry = async () => {
    // Query moments where needsImportances is empty
    const emptyNeedsImportancesQuery = query(
      collection(db, `users/${user.value.uid}/moments`),
      where("needsImportances", "==", {}),
      where("retries", "<", 3),
      orderBy("retries"),
      limit(3),
    );
    const momentsWithEmptyNeedsImportances = await getDocs(
      emptyNeedsImportancesQuery,
    );

    //retry to call LLM and increment the retries counter //TODO: 1 parallelize the calls to LLM
    for (const doc of momentsWithEmptyNeedsImportances.docs) {
      console.log(
        "In emptyNeedsMomentsRetry, emptyNeedsImportancesQuery returned:",
        doc.data(),
      );

      await updateDoc(doc.ref, {
        retries: increment(1),
      });
      const idToken = await user.value.getIdToken(/* forceRefresh */ true);
      console.log(
        "In emptyNeedsMomentsRetry, triggering retry call to llm for moment",
        doc.data().text,
      );
      const response = await axios.get(`/api/learn/needs/`, {
        params: {
          momentText: doc.data().text,
          momentDate: JSON.stringify(doc.data().date),
          momentId: doc.id,
        },
        headers: {
          authorization: `Bearer ${idToken}`,
        },
      });

      console.log(
        "Successful retry llm call for moment '",
        doc.data().text,
        "' :",
        response.data,
      );
    }
  };

  const addMoment = async (moment) => {
    try {
      console.log("In addMoment, moment:", moment);
      const batch = writeBatch(db);

      // Add the new moment in momentsColl (note addDoc not working as per https://github.com/firebase/firebase-js-sdk/issues/5549#issuecomment-1043389401)
      const newMomDocRef = doc(
        collection(db, `users/${user.value.uid}/moments`),
      );
      batch.set(newMomDocRef, moment);
      batch.update(newMomDocRef, { needsImportances: {}, retries: 0 });

      // Update the tag statistics in tagsColl for the tags of the new moment
      for (const tag of moment.tags) {
        console.log("In for (const tag of moment.tags), tag:", tag);
        const tagDocRef = doc(db, `users/${user.value.uid}/tags`, tag);
        const tagDoc = await getDoc(tagDocRef);
        const tagData = {
          id: newMomDocRef.id,
          date: moment.date,
          intensity: moment.intensity,
          tags: moment.tags,
          text: moment.text,
        };
        if (tagDoc.exists())
          batch.update(tagDocRef, { tagMoments: arrayUnion(tagData) });
        else batch.set(tagDocRef, { tagMoments: [tagData] });
      }

      // Remove moment.date time and save the Timestamp to momentsDays array
      // console.log("In addMoment, moment.date:", moment.date);
      const ts = new Timestamp(moment.date.seconds, moment.date.nanoseconds);
      const dateObj = ts.toDate();
      dateObj.setHours(0, 0, 0, 0);
      // console.log("In addMoment, dateWithoutTime:", dateObj);
      batch.update(userDocRef.value, {
        momentsDays: arrayUnion(Timestamp.fromDate(dateObj)),
      });

      await batch.commit();

      //LLM NEEDS ASSESSMENT (due to being in async func, this only runs when/if the await batch.commit() is resolved and only if it is also fulfilled as otherwise the try/catch will catch the error and the code will not continue to run)
      //WARNING the following may take up to 30s to complete if bad connection, replies, llm hallucinations OR never complete
      const idToken = await user.value.getIdToken(/* forceRefresh */ true);
      console.log(
        "In addMoment, triggering call to llm for moment",
        newMomDocRef.id,
        moment.text,
      );
      const response = await axios.get(`/api/learn/needs/`, {
        params: {
          momentText: moment.text,
          momentDate: JSON.stringify(moment.date),
          momentId: newMomDocRef.id,
        },
        headers: {
          authorization: `Bearer ${idToken}`,
        },
      });
      console.log("In addMoment", response.data);
    } catch (error) {
      console.log("Error in addMoment", error);
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

  const uniqueDays = computed(() => {
    if (!userFetched.value || !userDoc.value.data?.momentsDays.length) {
      return [];
    }

    const daysTime = userDoc.value.data.momentsDays.map((day) => {
      // Convert Firestore Timestamp to JavaScript Date, format of moment.date is like {seconds: 1678296892, nanoseconds: 210000000}
      const dayTs = new Timestamp(day.seconds, day.nanoseconds);
      const dayDate = dayTs.toDate();
      return dayDate.getTime(); //TODO: 2 improve perf
    });

    //Sort in descending order (most recent first) & return
    daysTime.sort((a, b) => b - a);
    return daysTime.map((day) => date.formatDate(day, "MMMM D, YYYY"));
  });

  const oldestMomentDate = computed(() => {
    if (!userFetched.value || !userDoc.value.data?.momentsDays.length) {
      return;
    }

    const sortedTimestamps = userDoc.value.data.momentsDays.sort(
      (a, b) => a.seconds - b.seconds,
    );

    // Get the oldest timestamp and convert it to a JS Date format
    return sortedTimestamps[0].toDate();
  });

  const setIsEditorFocused = (isFocused) => {
    isEditorFocused.value = isFocused;
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

  const getTags = (
    dateRange,
    filterBy = "all",
    sortBy = "avgIntensity",
    descending = true,
  ) => {
    return computed(() => {
      console.log("getTags called with dateRange", dateRange);
      if (
        !tagsColl.value ||
        !tagsColl.value.data ||
        tagsColl.value.data.length === 0
      ) {
        console.log(
          "In getTags, returning empty array bec. tagsColl.value:",
          tagsColl.value,
          "or tagsColl.value.data:",
          tagsColl.value.data,
        );
        return [];
      }

      const momentsList = momentsColl.value.data.filter((moment) => {
        const ts = new Timestamp(moment.date.seconds, moment.date.nanoseconds);
        const date = ts.toDate();
        date.setHours(0, 0, 0, 0);
        return date >= dateRange[0] && date <= dateRange[1];
      });

      console.log("In getTags, starting to build tagList");
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

      console.log("In getTags, returning tagList:", tagList);
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
      console.log("Error in updateUser: ", error);
    }
  };

  return {
    user,
    momentsColl,
    isEditorFocused,
    uniqueTags,
    uniqueDays,
    oldestMomentDate,
    userFetched,
    momentsFetched,
    aggregateDataFetched,
    hasNeeds,
    needsMap,
    aggregateData,
    getTags,
    addMoment,
    fetchUser,
    fetchMoments,
    fetchAggregateData,
    updateUser,
    setIsEditorFocused,
    emptyNeedsMomentsRetry,
  };
});

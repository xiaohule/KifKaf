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
  const aggregateData = ref({});
  const userFetched = ref(false);
  const momentsFetched = ref(false);
  const aggregateDataFetched = ref(false);
  const isEditorFocused = ref(false);
  const needsMap = ref({
    //add 'Work-Life Balance'?
    "Physical Well-Being": "🛡️", //readd Physical safety dedans ou split
    "Sustenance & Nourishment": "🍎",
    Shelter: "🏠",
    "Financial Security": "💰",
    "Rest & Relaxation": "🌙", //🛋️ //🛌
    "Physical Movement": "🤸",
    "Physical Contact & Intimacy": "👐",
    "Contact with Nature": "🏞️",
    "Social Connection": "👥",
    "Belongingness & Community": "🏘️",
    "Support, Understanding & Validation": "👂", // séparer "Support from Understanding & Validation"? OU réduire à Support & Understanding?
    "Affection & Love": "❤️",
    "Emotional Safety & Inner Peace": "🧘‍♂️", //"🤗",
    "Boundaries & Privacy": "🚪",
    Autonomy: "🛤️",
    "Self-Esteem & Social Recognition": "💪",
    "Competence & Effectiveness": "🎯",
    "Outward Care & Contribution": "🤲", //break in 2?
    "Self-Expression & Creativity": "🎨",
    "Exploration, Novelty & Inspiration": "🌌", //🌎 // réduire à Exploration & Novelty?
    Learning: "📚",
    "Self-Actualization": "🌱", //merge learning and self-actualization?
    Challenge: "⛰️",
    "Play, Humor & Entertainment": "🎠", // "😂","⚽",🎭
    "Fairness & Justice": "⚖️", //🕊️
    "Order & Structure": "📐",
    "Meaning & Purpose": "🧭", //🌌
    "Gratitude & Celebration": "🎈", //🎉 //🕯️
    "Spiritual Transcendence": "🌸",
  });

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

      momentsFetched.value = true;
    } catch (error) {
      console.log("Error in fetchMoments", error);
    }
  };

  const getMomentById = computed(() => {
    return async (momentId, momentRef) => {
      try {
        if (!momentId) {
          console.log("In getMomentById, momentId is null, returning null");
          return null;
        }
        if (!momentsFetched.value) {
          console.log(
            "In getMomentById, moments not yet fetched, fetching them",
          );
          await fetchMoments();
        }

        onSnapshot(
          doc(db, `users/${user.value.uid}/moments/${momentId}`),
          (doc) => {
            momentRef.value = doc.data();
          },
        );
      } catch (error) {
        console.log("Error in getMomentById", error);
      }
    };
  });

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
    // Query moments where needsSatisAndImp is empty
    const emptyNeedsSatisAndImpQuery = query(
      collection(db, `users/${user.value.uid}/moments`),
      where("needsSatisAndImp", "==", {}),
      where("retries", "<", 3),
      orderBy("retries"),
      limit(3),
    );
    const momentsWithEmptyNeedsSatisAndImp = await getDocs(
      emptyNeedsSatisAndImpQuery,
    );

    //retry to call LLM and increment the retries counter //TODO:1 parallelize the calls to LLM
    for (const doc of momentsWithEmptyNeedsSatisAndImp.docs) {
      console.log(
        "In emptyNeedsMomentsRetry, emptyNeedsSatisAndImpQuery returned:",
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
      batch.update(newMomDocRef, {
        needsSatisAndImp: {},
        retries: 0,
      });

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
    if (!userFetched.value || !userDoc?.value?.data?.momentsDays?.length) {
      return [];
    }
    let ul = userDoc.value.data.momentsDays.map((day) => day.seconds);
    //Sort in descending order (most recent first) & return
    return ul.sort((a, b) => b - a);
  });

  const getFormattedDate = (seconds, showHour = false, forDisplay = true) => {
    if (!seconds) {
      return;
    }

    const ts = new Timestamp(seconds, 0); //Timestamp {seconds: 1679961600, nanoseconds: 0}
    const dt = ts.toDate(); //Tue Mar 28 2023 02:00:00 GMT+0200 (Central European Summer Time)
    const today = new Date();

    if (!forDisplay) return date.formatDate(dt, "MMMM D, YYYY");

    const day = date.isSameDate(dt, today, "day")
      ? "Today"
      : date.isSameDate(dt, today - 86400000, "day")
      ? "Yesterday"
      : date.isSameDate(dt, today, "year")
      ? date.formatDate(dt, "MMMM D")
      : date.formatDate(dt, "MMMM D, YYYY");

    if (showHour) return day + ", " + date.formatDate(dt, "HH:mm");
    else return day;
  };

  const oldestMomentDate = computed(() => {
    if (!userFetched.value || !userDoc?.value?.data?.momentsDays?.length) {
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

  function $reset() {
    user.value = null;
    userDocRef.value = null;
    userDoc.value = null;
    momentsColl.value = [];
    aggregateData.value = {};
    userFetched.value = false;
    momentsFetched.value = false;
    aggregateDataFetched.value = false;
    isEditorFocused.value = false;
    needsMap.value = {};
  }

  return {
    user,
    momentsColl,
    isEditorFocused,
    uniqueDays,
    oldestMomentDate,
    userFetched,
    momentsFetched,
    aggregateDataFetched,
    hasNeeds,
    needsMap,
    aggregateData,
    getMomentById,
    getFormattedDate,
    addMoment,
    fetchUser,
    fetchMoments,
    fetchAggregateData,
    updateUser,
    setIsEditorFocused,
    emptyNeedsMomentsRetry,
    $reset,
  };
});

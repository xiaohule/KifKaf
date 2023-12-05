import { defineStore } from "pinia";
import {
  collection,
  doc,
  writeBatch,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
} from "firebase/firestore";
import { db } from "../boot/firebaseBoot.js";
import { ref, computed } from "vue";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import axios from "axios";
import { Notify } from "quasar";
import { currentUser } from "../boot/firebaseBoot.js";
import { date } from "quasar";
const { isSameDate, startOfDate, endOfDate, isBetweenDates } = date;
import { useDateUtils } from "../composables/dateUtils.js";

export const useMomentsStore = defineStore("moments", () => {
  const { currentDate, currentYear, currentYYYYdMM, dayToDate } =
    useDateUtils();
  const user = currentUser;
  const userDocRef = ref(null);
  const userDoc = ref(null);
  const momentsColl = ref([]);
  const aggregateData = ref({});
  const userFetched = ref(false);
  const momentsFetched = ref(false);
  const aggregateDataFetched = ref(false);
  const shouldResetSwiper = ref(false);
  const savedPeriodicity = ref(null);
  const savedActiveIndex = ref(null);
  const savedToggleValue = ref(null);
  const savedSegmentClicked = ref(null);

  const fetchUser = async () => {
    try {
      console.log("In moments.js, In fetchUser");
      if (userFetched.value) {
        console.log("In moments.js, In fetchUser, already userFetched");
        return;
      }

      // Check if user exists and has a uid property
      if (!user.value || !user.value.uid) {
        console.log("In moments.js, failed to fetch user or user.uid");
        return;
      }

      // Check if user doc exists, if not create & initialize it, BEWARE this way of doing means that if we add new field to the user doc data model a script/manual update should be run to add it to existing users (but it's better than the alternative of transactional write for offline)
      userDocRef.value = doc(db, "users", `${user.value.uid}`);
      const defaultUserDocValues = {
        deviceLanguage: "en-US",
        hasNeeds: false,
        welcomeTutorialStep: 0,
        showWelcomeTutorial: true,
      };
      try {
        const userDoc = await getDoc(userDocRef.value);
        if (
          !userDoc.exists() ||
          !userDoc.data().hasOwnProperty("showWelcomeTutorial")
        ) {
          console.log(
            "In moments.js > fetchUser, User doc not initialized, initializing it",
          );
          await setDoc(userDocRef.value, defaultUserDocValues, {
            merge: true,
          });
        }
      } catch (e) {
        console.log("In moments.js > fetchUser, getDoc failed: ", e);
      }

      onSnapshot(userDocRef.value, (doc) => {
        userDoc.value = doc.data();
      });

      userFetched.value = true;
    } catch (error) {
      console.log("Error in fetchUser", error);
    }
  };

  const updateUser = async (changes) => {
    try {
      if (changes.displayName) {
        await updateProfile(user.value, {
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

  const getDeviceLanguage = computed(() => {
    return userDoc?.value?.deviceLanguage ?? false;
  });

  const getHasNeeds = computed(() => {
    return userDoc?.value?.hasNeeds ?? false;
  });

  const setAuthorizationCode = async (authorizationCode) => {
    try {
      if (!userFetched.value) {
        console.log(
          "In moment.js > setAuthorizationCode: User not yet fetched, fetching it",
        );
        await fetchUser();
      }

      await setDoc(userDocRef.value, { authorizationCode }, { merge: true });
    } catch (error) {
      console.log("Error in setAuthorizationCode", error);
    }
  };
  const getAuthorizationCode = computed(() => {
    return userDoc?.value?.authorizationCode ?? false;
  });

  const setSpeechRecoLanguage = async (speechRecoLanguage) => {
    try {
      if (!userFetched.value) {
        console.log(
          "In moment.js > setSpeechRecoLanguage: User not yet fetched, fetching it",
        );
        await fetchUser();
      }

      await setDoc(userDocRef.value, { speechRecoLanguage }, { merge: true });
    } catch (error) {
      console.log("Error in setSpeechRecoLanguage", error);
    }
  };
  const getSpeechRecoLanguage = computed(() => {
    return userDoc?.value?.speechRecoLanguage ?? false;
  });

  const setSignInMethods = async (signInMethods) => {
    try {
      if (!userFetched.value) {
        console.log(
          "In moment.js > setSignInMethods: User not yet fetched, fetching it",
        );
        await fetchUser();
      }

      await setDoc(userDocRef.value, { signInMethods }, { merge: true });
    } catch (error) {
      console.log("Error in setSignInMethods", error);
    }
  };
  const getSignInMethods = computed(() => {
    return userDoc?.value?.signInMethods ?? false;
  });

  const setShowWelcomeTutorial = async (showWelcomeTutorial) => {
    try {
      if (!userFetched.value) {
        console.log(
          "In moment.js >setShowWelcomeTutorial: User not yet fetched, fetching it",
        );
        await fetchUser();
      }
      console.log(
        "In setShowWelcomeTutorial, showWelcomeTutorial:",
        showWelcomeTutorial,
      );
      await setDoc(userDocRef.value, { showWelcomeTutorial }, { merge: true });
    } catch (error) {
      console.log("Error in setShowWelcomeTutorial", error);
    }
  };
  const getShowWelcomeTutorial = computed(() => {
    return userDoc?.value?.showWelcomeTutorial ?? false;
  });

  const setWelcomeTutorialStep = async (welcomeTutorialStep) => {
    try {
      if (!userFetched.value) {
        console.log(
          "In moment.js > setWelcomeTutorialStep: User not yet fetched, fetching it",
        );
        await fetchUser();
      }
      await setDoc(userDocRef.value, { welcomeTutorialStep }, { merge: true });
    } catch (error) {
      console.log("Error in setWelcomeTutorialStep", error);
    }
  };
  const getWelcomeTutorialStep = computed(() => {
    return userDoc?.value?.welcomeTutorialStep ?? false;
  });

  const deleteMoment = async (momentId) => {
    try {
      console.log("In moment.js > deleteMoment for momentId:", momentId);
      // const momentDoc = doc(
      //   db,
      //   `users/${user.value.uid}/moments/${momentId}`,
      // );
      const momentDoc = doc(db, "users", user.value.uid, "moments", momentId);
      const momentArchive = (await getDoc(momentDoc)).data();
      const momentsCollLength = momentsColl.value.length;
      const otherMomHasNeeds = momentsColl.value.some((moment) => {
        return (
          moment.id !== momentId &&
          moment.needs &&
          Object.keys(moment.needs).length > 0
        );
      });

      console.log(
        "momentDoc:",
        momentDoc,
        "momentArchive:",
        momentArchive,
        "momentsCollLength:",
        momentsCollLength,
        "otherMomHaveNeeds:",
        otherMomHasNeeds,
      );

      const batch = writeBatch(db);

      batch.delete(momentDoc);

      if (!otherMomHasNeeds) {
        batch.update(userDocRef.value, {
          welcomeTutorialStep: momentsCollLength < 2 ? 0 : 1,
          hasNeeds: false,
        });
      }

      await batch.commit();

      //TODO:5 batch to also add momid and momarchive to list of deleted moments in user doc so that it can be used for retries
      if (navigator.onLine) {
        Notify.create("Moment deleted.");
      } else {
        Notify.create(
          "Moment deleted. Insights recalculation will complete next time you’re online.",
        );
      }

      const idToken = await user.value.getIdToken(/* forceRefresh */ true);
      console.log(
        "In deleteMoment, will trigger insights recalculation bec. deletion of mom:",
        momentId,
      );
      const response = await axios.post(
        `/api/learn/delete-moment/`,
        {
          momentId,
          momentArchive,
        },
        {
          headers: {
            authorization: `Bearer ${idToken}`,
          },
        },
      );
      console.log("In deleteMoment", response.data);
      await fetchAggregateData(true /*force*/); //to get the insights update if older period
      // TODO:4 this is a bit overkill, we could just update the relevant aggregate docs
      Notify.create("Insights recalculation complete.");
    } catch (error) {
      console.log("Error in deleteMoment", error);
    }
  };

  const addMoment = async (moment) => {
    try {
      console.log("In addMoment for:", moment);
      moment.needs = {};
      moment.retries = 0;

      // Add the new moment in momentsColl (note addDoc not working as per https://github.com/firebase/firebase-js-sdk/issues/5549#issuecomment-1043389401)
      const newMomDocRef = doc(
        collection(db, `users/${user.value.uid}/moments`),
      );
      await setDoc(newMomDocRef, moment);

      if (navigator.onLine) {
        Notify.create("Moment saved.");
      } else {
        Notify.create(
          "Moment saved. Needs analysis will complete next time you’re online.",
        );
      }

      if (!getWelcomeTutorialStep.value || getWelcomeTutorialStep.value === 0)
        await setWelcomeTutorialStep(1);
      //LLM NEEDS ASSESSMENT (due to being in async func, this only runs when/if the previous await are resolved and only if it is also fulfilled as otherwise the try/catch will catch the error and the code will not continue to run)
      //WARNING the following may take up to 30s to complete if bad connection, replies, llm hallucinations OR never complete
      const idToken = await user.value.getIdToken(/* forceRefresh */ true);
      console.log("In addMoment, will trigger call to llm for:", moment);
      const response = await axios.post(
        `/api/learn/add-moment/`,
        {
          momentText: moment.text,
          momentDate: JSON.stringify(moment.date),
          momentId: newMomDocRef.id,
        },
        {
          headers: {
            authorization: `Bearer ${idToken}`,
          },
        },
      );
      console.log("In addMoment", response.data);
      Notify.create("Needs analysis complete.");
    } catch (error) {
      console.log("Error in addMoment", error);
    }
  };

  const fetchMoments = async () => {
    try {
      if (momentsFetched.value) {
        console.log("In fetchMoments, already momentsFetched");
        return;
      }
      if (!userFetched.value) {
        console.log(
          "In moment.js > fetchMoments: User not yet fetched, fetching it",
        );
        await fetchUser();
      }

      const q = query(collection(db, `users/${user.value.uid}/moments`));
      onSnapshot(q, (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          const { newIndex, oldIndex, doc, type } = change;
          if (type === "added") {
            momentsColl.value.splice(newIndex, 0, {
              ...doc.data(),
              id: doc.id,
            });
            // if we want to handle references we would do it here
          } else if (type === "modified") {
            // remove the old one first
            momentsColl.value.splice(oldIndex, 1);
            // if we want to handle references we would have to unsubscribe
            // from old references' listeners and subscribe to the new ones
            momentsColl.value.splice(newIndex, 0, {
              ...doc.data(),
              id: doc.id,
            });
          } else if (type === "removed") {
            momentsColl.value.splice(oldIndex, 1);
            // if we want to handle references we need to unsubscribe
            // from old references
          }
        });
      });

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

  const getLatestMomWithNeedsId = computed(() => {
    if (
      !momentsFetched.value ||
      !getHasNeeds.value || // return null if user has no needs to block welcome tuto button "View needs"
      !momentsColl.value.length
    ) {
      return;
    }
    const sortedMoms = [...momentsColl.value].sort(
      (a, b) => b.date.seconds - a.date.seconds,
    );

    // Filter moments to include only those whose 'needs' object exists is not 'Oops'
    const filteredMoms = sortedMoms.filter(
      (moment) =>
        Object.keys(moment.needs).length > 0 &&
        !moment.needs.Oops &&
        !moment.needs.error,
    );

    if (filteredMoms.length > 0) {
      return filteredMoms[0].id;
    } else {
      return sortedMoms[0].id;
    }
  });

  const fetchAggregateData = async (force = false) => {
    try {
      if (!force && aggregateDataFetched.value) {
        console.log("In fetchAggregateData, already aggregateDataFetched");
        return;
      }
      if (!userFetched.value) {
        console.log(
          "In moment.js > fetchAggregateData: User not yet fetched, fetching it",
        );
        await fetchUser();
      }

      onSnapshot(
        doc(db, `users/${user.value.uid}/aggregateYearly/${currentYear.value}`),
        (doc) => {
          aggregateData.value[currentYear.value] = doc.data();
        },
      );

      onSnapshot(
        doc(
          db,
          `users/${user.value.uid}/aggregateMonthly/${currentYYYYdMM.value}`,
        ),
        (doc) => {
          aggregateData.value[currentYYYYdMM.value] = doc.data();
        },
      );

      //TODO:2 first try getDocsFromCache, if fails then getDocsFromServer
      getDocs(collection(db, `users/${user.value.uid}/aggregateYearly`)).then(
        (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            if (doc.id.length === 4 && doc.id !== currentYear.value) {
              aggregateData.value[doc.id] = doc.data();
              // needsAggregatePrevYears.value[doc.id] = ref(doc.data());
            }
          });
        },
      );

      getDocs(collection(db, `users/${user.value.uid}/aggregateMonthly`)).then(
        (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            if (doc.id.length === 7 && doc.id !== currentYYYYdMM.value) {
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

  //DATES
  const getUniqueDaysTs = computed(() => {
    console.log(
      "In moments.js > getUniqueDaysTs, momentsColl.value:",
      momentsColl.value,
      "returning:",
      getUniqueDaysDateFromDateRangeAndNeed(),
    );
    return getUniqueDaysDateFromDateRangeAndNeed();
  });

  const getOldestMomentDate = computed(() => {
    return (
      getUniqueDaysTs.value[getUniqueDaysTs.value.length - 1] ??
      currentDate.value
    );
  });

  const getUniqueDaysDateFromDateRangeAndNeed = (dateRange = "", need = "") => {
    console.log(
      "In moments.js > getUniqueDaysDateFromDateRangeAndNeed, momentsFetched",
      momentsFetched.value,
      " dateRange:",
      dateRange,
      "need:",
      need,
    );
    if (!momentsFetched.value) {
      return [];
    }

    const uniqueDaysSet = new Set();

    let dateFrom, dateTo;
    if (dateRange) {
      if (dateRange.split("-").length === 1) {
        //yearly
        dateFrom = startOfDate(dateRange, "year");
        dateTo = endOfDate(dateRange, "year");
      } else {
        //monthly
        dateFrom = startOfDate(dateRange, "month");
        dateTo = endOfDate(dateRange, "month");
      }
    }
    console.log(
      "in getUniqueDaysDateFromDateRangeAndNeed, dateFrom:",
      dateFrom,
      "dateTo:",
      dateTo,
    );

    momentsColl.value.forEach((moment) => {
      const momentDate = moment.date.toDate();
      if (
        !dateRange ||
        isBetweenDates(momentDate, dateFrom, dateTo, {
          inclusiveFrom: true,
          inclusiveTo: true,
        })
      ) {
        console.log(
          "In getUniqueDaysDateFromDateRangeAndNeed, momentDate:",
          momentDate,
          "moment:",
          moment,
        );
        if (!need || moment.needs[need]) {
          const dayStr = startOfDate(momentDate, "day").toISOString(); //toISOStr to make it a string so that Set can ensure uniqueness
          uniqueDaysSet.add(dayStr);
        }
      }
    });

    console.log(
      "In moments.js > getUniqueDaysDateFromDateRangeAndNeed, uniqueDaysSet:",
      uniqueDaysSet,
    );
    return Array.from(uniqueDaysSet)
      .map((dayStr) => new Date(dayStr))
      .sort((a, b) => b - a); // Sort in descending order
  };

  const getSortedMomsFromDayAndNeed = /*async*/ (day, need = "") => {
    // if (!momentsFetched.value) {
    //   await fetchMoments();
    // }
    console.log("In getSortedMomsFromDayAndNeed");
    const dayDate = dayToDate(day);

    let moms = momentsColl.value.filter((moment) =>
      isSameDate(moment.date.toDate(), dayDate, "day"),
    );

    if (need) {
      moms = moms.filter((moment) => moment.needs[need]);
    }

    return moms?.sort((a, b) => b.date.seconds - a.date.seconds);
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
    shouldResetSwiper.value = false;
    savedPeriodicity.value = null;
    savedActiveIndex.value = null;
    savedToggleValue.value = null;
    savedSegmentClicked.value = null;
  }

  return {
    user,
    momentsColl,
    shouldResetSwiper,
    savedPeriodicity,
    savedActiveIndex,
    savedToggleValue,
    savedSegmentClicked,
    userFetched,
    getHasNeeds,
    getAuthorizationCode,
    getDeviceLanguage,
    getSpeechRecoLanguage,
    getSignInMethods,
    getShowWelcomeTutorial,
    getWelcomeTutorialStep,
    momentsFetched,
    getUniqueDaysTs,
    getOldestMomentDate,
    getMomentById,
    getLatestMomWithNeedsId,
    aggregateDataFetched,
    aggregateData,
    setWelcomeTutorialStep,
    setShowWelcomeTutorial,
    addMoment,
    deleteMoment,
    fetchUser,
    updateUser,
    setAuthorizationCode,
    setSpeechRecoLanguage,
    setSignInMethods,
    fetchMoments,
    fetchAggregateData,
    getUniqueDaysDateFromDateRangeAndNeed,
    getSortedMomsFromDayAndNeed,
    $reset,
  };
});

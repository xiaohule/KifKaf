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
import { ref, computed, watch } from "vue";
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
const {
  getDateDiff,
  isSameDate,
  startOfDate,
  endOfDate,
  isBetweenDates,
  addToDate,
  formatDate,
} = date;

import { useDateUtils } from "../composables/dateUtils.js";

export const useMomentsStore = defineStore("moments", () => {
  const {
    currentDate,
    currentYear,
    currentYYYYdMM,
    dayToDate,
    getDatePickerLabel,
    monthDateRangeToDate,
  } = useDateUtils();
  const user = currentUser;
  const userDocRef = ref(null);
  const momentsCollRef = ref(null);
  const userDoc = ref(null);
  const momentsColl = ref([]);
  const aggDataNeeds = ref({});
  const aggDataInsights = ref({});
  const userFetched = ref(false);
  const momentsFetched = ref(false);
  const aggregateDataFetched = ref(false);
  const shouldResetSwiper = ref(false);
  const donutSegmentClicked = ref(null);

  const insightsInitialized = ref(false);
  const needsToggleModel = ref("top");
  const activeIndex = ref(null);
  const segDateId = ref("Monthly");
  const activeDateRange = computed(() => {
    console.log(
      "In moment.js > computed activeDateRange, activeIndex",
      activeIndex.value,
      "segDateId",
      segDateId.value,
    );
    return (
      dateRanges.value[activeIndex.value] ??
      formatDate(currentDate.value, "YYYY-MM")
    );
  });
  const dateRangeButtonLabel = computed(() =>
    getDatePickerLabel(activeDateRange.value),
  );

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

  const getOldestMomentDateYYYYsMM = computed(() => {
    return formatDate(getOldestMomentDate.value, "YYYY/MM");
  });

  const monthsSinceOldestMoment = computed(() =>
    getDateDiff(currentDate.value, getOldestMomentDate.value, "months"),
  );
  const dateRangesMonths = computed(() => {
    const dateRanges = [];

    let trackingDate = startOfDate(getOldestMomentDate.value, "month");
    for (let i = 0; i <= monthsSinceOldestMoment.value; i++) {
      dateRanges.push(formatDate(trackingDate, "YYYY-MM"));
      trackingDate = addToDate(trackingDate, { months: 1 });
    }
    console.log(
      "In moments.js > computed dateRangesMonths, dateRanges is",
      dateRanges,
    );
    return dateRanges;
  });

  watch(
    dateRangesMonths,
    (newValue, oldValue) => {
      // && !insightsInitialized.value
      if (
        segDateId.value === "Monthly" &&
        oldValue?.length !== newValue?.length &&
        activeIndex.value !== newValue?.length - 1
      ) {
        console.log(
          "In moments.js > watch dateRangesMonths, dateRangesMonths updated from ",
          oldValue,
          "to",
          newValue,
          "updating activeIndex from",
          activeIndex.value,
          "to",
          newValue.length - 1,
        );
        activeIndex.value = newValue.length - 1;
        // insightsInitialized.value = true; //block the first update of activeIndex to the last index once done once, to avoid swiping just bec. new add data
      }
    },
    { immediate: true },
  );

  const yearsSinceOldestMoment = computed(() =>
    getDateDiff(currentDate.value, getOldestMomentDate.value, "years"),
  );

  const dateRangesYears = computed(() => {
    console.log(
      "In moments.js > computed dateRangesYears, currentDate.value",
      currentDate.value,
      "getOldestMomentDate",
      getOldestMomentDate.value,
    );
    const dateRanges = [];
    for (let i = yearsSinceOldestMoment.value; i >= 0; i--) {
      dateRanges.push((currentYear.value - i).toString());
    }
    console.log(
      "In moments.js > computed dateRangesYears, dateRanges is",
      dateRanges,
    );
    return dateRanges;
  });

  watch(
    dateRangesYears,
    (newValue, oldValue) => {
      // && !insightsInitialized.value
      if (
        segDateId.value === "Yearly" &&
        oldValue?.length !== newValue?.length &&
        activeIndex.value !== newValue.length - 1
      ) {
        activeIndex.value = newValue.length - 1;
        // insightsInitialized.value = true;
      }
    },
    { immediate: true },
  );

  const dateRanges = computed(() => {
    console.log(
      "In moments.js > computed dateRanges, segDateId",
      segDateId.value,
      "returning:",
      segDateId.value === "Monthly"
        ? dateRangesMonths.value
        : dateRangesYears.value,
    );
    return segDateId.value === "Monthly"
      ? dateRangesMonths.value
      : dateRangesYears.value;
  });

  //when user tap on the Insights tab while already in the Insights tab, set activeIndex to the last index
  watch(shouldResetSwiper, (newVal) => {
    console.log("In moments.js > watch shouldResetSwiper, newVal", newVal);
    if (newVal) {
      activeIndex.value = dateRanges.value.length - 1;
      shouldResetSwiper.value = false;
    }
  });

  const pickedDateYYYYsMMsDD = ref(formatDate(currentDate.value, "YYYY/MM/DD"));

  watch(activeIndex, (newVal) => {
    console.log("In moments.js > watch activeIndex, newVal", newVal);
    if (segDateId.value === "Monthly") {
      pickedDateYYYYsMMsDD.value = formatDate(
        monthDateRangeToDate(activeDateRange.value),
        "YYYY/MM/DD",
      );
    } else if (segDateId.value === "Yearly") {
      pickedDateYYYYsMMsDD.value = formatDate(
        activeDateRange.value,
        "YYYY/MM/DD",
      );
    }
  });

  const suggestions = computed(() => {
    const suggestions = {
      continue: ["Engaging Regularly in Physical Activities"],
      stop: ["Seeing Max", "Working without pause", "Calling your mum"],
      start: [
        "Mindfulness and Relaxation Practices",
        "Engaging in a creative hobby like painting, writing, or playing a musical instrument",
      ],
    };
    return suggestions;
  });

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
      momentsCollRef.value = collection(userDocRef.value, "moments");
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
      } catch (error) {
        console.log("In moments.js > fetchUser, getDoc failed: ", error);
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
      const momentDoc = doc(momentsCollRef.value, momentId);
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
      moment.sentToThread = false;

      // Add the new moment in momentsColl (note addDoc not working as per https://github.com/firebase/firebase-js-sdk/issues/5549#issuecomment-1043389401)
      const newMomDocRef = doc(momentsCollRef.value);
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

      const q = query(momentsCollRef.value);
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

        onSnapshot(doc(momentsCollRef.value, momentId), (doc) => {
          momentRef.value = doc.data();
        });
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

      const aggYearlyCollRef = collection(userDocRef.value, "aggregateYearly");
      const aggMonthlyCollRef = collection(
        userDocRef.value,
        "aggregateMonthly",
      );

      //AGGDATANEEDS
      onSnapshot(doc(aggYearlyCollRef, currentYear.value), (doc) => {
        aggDataNeeds.value[currentYear.value] = doc.data();
      });

      onSnapshot(doc(aggMonthlyCollRef, currentYYYYdMM.value), (doc) => {
        aggDataNeeds.value[currentYYYYdMM.value] = doc.data();
      });

      //TODO:2 first try getDocsFromCache, if fails then getDocsFromServer
      getDocs(aggYearlyCollRef).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.id.length === 4 && doc.id !== currentYear.value) {
            aggDataNeeds.value[doc.id] = doc.data();
            // needsAggregatePrevYears.value[doc.id] = ref(doc.data());
          }
        });
      });

      getDocs(aggMonthlyCollRef).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.id.length === 7 && doc.id !== currentYYYYdMM.value) {
            aggDataNeeds.value[doc.id] = doc.data();
          }
        });
      });

      //AGGDATAINSIGHTS
      onSnapshot(
        doc(aggYearlyCollRef, `${currentYear.value}-insights`),
        (doc) => {
          aggDataInsights.value[currentYear.value] = doc.data();
        },
      );

      onSnapshot(
        doc(aggMonthlyCollRef, `${currentYYYYdMM.value}-insights`),
        (doc) => {
          aggDataInsights.value[currentYYYYdMM.value] = doc.data();
        },
      );

      getDocs(aggYearlyCollRef).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (
            doc.id.endsWith("-insights") &&
            doc.id !== `${currentYear.value}-insights`
          ) {
            aggDataInsights.value[doc.id.split("-")[0]] = doc.data();
          }
        });
      });

      getDocs(aggMonthlyCollRef).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (
            doc.id.endsWith("-insights") &&
            doc.id !== `${currentYYYYdMM.value}-insights`
          ) {
            aggDataInsights.value[
              doc.id.split("-")[0] + "-" + doc.id.split("-")[1]
            ] = doc.data();
          }
        });
      });

      aggregateDataFetched.value = true;
      console.log(
        "In fetchAggregateData, aggDataNeeds.value:",
        aggDataNeeds.value,
      );
    } catch (error) {
      console.log("Error in fetchAggregateData", error);
    }
  };

  //DATES
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

  //TODO:5 replace other setDoc with this one
  const setUserDocValue = async (value) => {
    console.log("In moment.js > setUserDocValue for value", value);
    try {
      if (!userFetched.value) {
        await fetchUser();
      }
      await setDoc(userDocRef.value, { ...value }, { merge: true });
    } catch (error) {
      console.log(
        "In moment.js > Error in setUserDocValue for value",
        value,
        ",error:",
        error,
      );
    }
  };
  const getRevisitMoment = computed(() => {
    return userDoc?.value?.revisitMoment ?? false;
  });

  const getRandomMomentId = async (mood = "happy", atLeastWeeks = 3) => {
    // Check if today's date is different from the last revisit date
    console.log(
      "In moments.js > getRandomMomentId, getRevisitMoment.value:",
      getRevisitMoment.value,
      "currentDate.value:",
      currentDate.value,
    );
    if (getRevisitMoment.value.date === currentDate.value) {
      console.log(
        "In moments.js > getRandomMomentId, getRevisitMoment.value.date === currentDate.value, returning:",
        getRevisitMoment.value.id,
      );
      return getRevisitMoment.value.id; // Return the cached ID
    }

    const weeksAgo = new Date();
    weeksAgo.setDate(weeksAgo.getDate() - atLeastWeeks * 7); // Subtract weeks

    const filteredMoments = momentsColl.value.filter((moment) => {
      const momentDate = moment.date.toDate();
      if (
        momentDate < weeksAgo &&
        Object.keys(moment.needs).length > 0 &&
        !moment.needs.Oops &&
        !moment.needs.error
      ) {
        return Object.values(moment.needs).some((need) =>
          mood === "happy"
            ? need.satisfaction > 0.5
            : need.dissatisfaction > 0.5,
        );
      }
      return false;
    });

    if (filteredMoments.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredMoments.length);
      setUserDocValue({
        revisitMoment: {
          id: filteredMoments[randomIndex].id,
          date: currentDate.value,
        },
      });
      return filteredMoments[randomIndex].id;
    }

    return null; // or any default value you prefer
  };

  function $reset() {
    user.value = null;
    userDocRef.value = null;
    momentsCollRef.value = null;
    userDoc.value = null;
    momentsColl.value = [];
    aggDataNeeds.value = {};
    aggDataInsights.value = {};
    userFetched.value = false;
    momentsFetched.value = false;
    aggregateDataFetched.value = false;
    shouldResetSwiper.value = false;
    donutSegmentClicked.value = null;
    insightsInitialized.value = false;
    dateRangeButtonLabel.value = "This month";
    needsToggleModel.value = "top";
    activeIndex.value = null;
    segDateId.value = "Monthly";
    pickedDateYYYYsMMsDD.value = formatDate(currentDate.value, "YYYY/MM/DD");
  }

  return {
    user,
    momentsColl,
    shouldResetSwiper,
    donutSegmentClicked,
    dateRangeButtonLabel,
    needsToggleModel,
    activeIndex,
    segDateId,
    activeDateRange,
    dateRanges,
    pickedDateYYYYsMMsDD,
    suggestions,
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
    getOldestMomentDateYYYYsMM,
    getMomentById,
    getLatestMomWithNeedsId,
    aggregateDataFetched,
    aggDataNeeds,
    aggDataInsights,
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
    getRandomMomentId,
    $reset,
  };
});

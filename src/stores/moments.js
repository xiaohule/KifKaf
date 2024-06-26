//src/store/moments.js
import { defineStore } from "pinia";
import {
  collection,
  doc,
  writeBatch,
  setDoc,
  updateDoc,
  addDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { ref, computed, watch } from "vue";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import axios from "axios";
import axiosRetry from "axios-retry";
import { Notify } from "quasar";
import {
  currentUser,
  logEvent,
  setUserProperty,
  db,
} from "src/boot/firebaseBoot.js";
import { pushNotifRegistrationToken } from "src/boot/pushNotificationsBoot.js";
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
import { useDateUtils } from "src/composables/dateUtils.js";
// import { useRouter } from "vue-router";
import { i18n } from "src/boot/i18nBoot.js";

axios.defaults.baseURL = process.env.API_URL;
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  onRetry: (retryCount, error, requestConfig) => {
    console.log(
      "In axiosRetry, retrying with retryCount:",
      retryCount,
      "err:",
      error,
      "requestConfig.url:",
      requestConfig.url,
      "requestConfig.data:",
      requestConfig.data,
    );
  },
});

const {
  currentDate,
  currentYear,
  currentYYYYdMM,
  currentHHmmRoundedTo15,
  dayToDate,
  monthDateRangeToDate,
} = useDateUtils();

export const useMomentsStore = defineStore("moments", () => {
  // const router = useRouter();
  const user = currentUser;
  const userDocRef = ref(null);
  const userDoc = ref(null);
  const fetchUserLock = ref(false);
  const userFetched = ref(false);
  const momentsCollRef = ref(null);
  const momentsColl = ref([]);
  const momentsFetched = ref(false);
  const aggMonthlyCollRef = ref(null);
  const aggYearlyCollRef = ref(null);
  const aggDataNeeds = ref({});
  const aggDataInsights = ref({});
  const aggDataNeedsFetched = ref(false);
  const aggDataInsightsFetched = ref(false);
  const donutSegmentClicked = ref(null);
  const firstOnSnapshotDone = ref(false);
  const needsToggleModel = ref("top");
  const activeIndex = ref(null);
  const segDateId = ref("Monthly");
  const newMomText = ref("");
  const pickedDateYYYYsMMsDD = ref(formatDate(currentDate.value, "YYYY/MM/DD"));
  const tmpPrivacyCheckboxState = ref(false);
  const tmpPrivacyPolicyConsent = ref(null);
  const tmpTermsOfServiceConsent = ref(null);
  const consentsCollRef = ref(null);
  const tmpUserIntentionsGroup = ref([]);
  const tmpUIsomethingElse = ref("");
  const tmpNotifs = ref({
    journalNotifs: true,
    insightsNotifs: true,
    journalNotifsTime: currentHHmmRoundedTo15.value,
  });
  const tmpNotifsUpdated = ref(false);
  const tmpLastLoginMethod = ref("");

  const getActiveDateRange = computed(() => {
    console.log(
      "In moment.js > computed getActiveDateRange, activeIndex",
      activeIndex.value,
      "segDateId",
      segDateId.value,
    );
    return (
      getDateRanges.value[activeIndex.value] ??
      formatDate(currentDate.value, "YYYY-MM")
    );
  });
  const getPrevDateRange = computed(() => {
    const prevIndex = activeIndex.value - 1;
    if (prevIndex >= 0) {
      return (
        getDateRanges.value[prevIndex] ??
        formatDate(currentDate.value, "YYYY-MM")
      );
    }
    return null;
  });

  const getUniqueDaysDateFromDateRangeAndNeed = (dateRange = "", need = "") => {
    // console.log(
    //   "In moments.js > getUniqueDaysDateFromDateRangeAndNeed, momentsFetched",
    //   momentsFetched.value,
    //   " dateRange:",
    //   dateRange,
    //   "need:",
    //   need,
    // );
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
      "in getUniqueDaysDateFromDateRangeAndNeed, dateRange:",
      dateRange,
      "need:",
      need,
      "dateFrom:",
      dateFrom,
      "dateTo:",
      dateTo,
    );

    momentsColl.value.forEach((moment) => {
      const momentDate = moment.date.toDate();
      if (
        (!moment.deleted && //to avoid deleted moments
          !dateRange) ||
        isBetweenDates(momentDate, dateFrom, dateTo, {
          inclusiveFrom: true,
          inclusiveTo: true,
        })
      ) {
        // console.log(
        //   "In getUniqueDaysDateFromDateRangeAndNeed, momentDate:",
        //   momentDate,
        //   "moment:",
        //   moment,
        // );
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
      "In moments.js > getUniqueDaysTs,",
      // " momentsColl.value:",
      // momentsColl.value,
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
      }
    },
    { immediate: true }, //TODO:9 this is not needed on many pages
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
      if (
        segDateId.value === "Yearly" &&
        oldValue?.length !== newValue?.length &&
        activeIndex.value !== newValue.length - 1
      ) {
        activeIndex.value = newValue.length - 1;
      }
    },
    { immediate: true },
  );

  const getDateRanges = computed(() => {
    console.log(
      "In moments.js > computed getDateRanges, segDateId",
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

  const resetToCurrentMonth = () => {
    segDateId.value = "Monthly";
    activeIndex.value = getDateRanges.value.length - 1;
  };

  watch(activeIndex, (newVal) => {
    console.log("In moments.js > watch activeIndex, newVal", newVal);
    if (segDateId.value === "Monthly") {
      pickedDateYYYYsMMsDD.value = formatDate(
        monthDateRangeToDate(getActiveDateRange.value),
        "YYYY/MM/DD",
      );
    } else if (segDateId.value === "Yearly") {
      pickedDateYYYYsMMsDD.value = formatDate(
        getActiveDateRange.value,
        "YYYY/MM/DD",
      );
    }
  });

  const fetchUser = async () => {
    console.log("In moments.js, In fetchUser");

    if (userFetched.value) {
      console.log("In moments.js > fetchUser, userFetched true, returning");
      return;
    }
    if (fetchUserLock.value) {
      console.log("In moments.js > fetchUser, fetchUserLock true, returning");
      return;
    }
    if (!user.value || !user.value.uid) {
      console.log("In moments.js > fetchUser, user not yet known, returning");
      return;
    }

    fetchUserLock.value = true; // Set the lock

    try {
      // Check if user doc exists, if not create & initialize it, BEWARE this way of doing means that if we add new field to the user doc data model a script/manual update should be run to add it to existing users (but it's better than the alternative of transactional write for offline)
      userDocRef.value = doc(db, "users", `${user.value.uid}`);
      momentsCollRef.value = collection(userDocRef.value, "moments");
      aggMonthlyCollRef.value = collection(
        userDocRef.value,
        "aggregateMonthly",
      );
      aggYearlyCollRef.value = collection(userDocRef.value, "aggregateYearly");
      consentsCollRef.value = collection(userDocRef.value, "consents");

      userFetched.value = true;
      console.log("In moments.js, userFetched true");

      onSnapshot(userDocRef.value, (snapshot) => {
        userDoc.value = snapshot.data();
        // console.log(
        //   "In moments.js > fetchUser > onSnapshot userDocRef, userDoc.value updated to:",
        //   userDoc.value,
        // );
      });

      //NOTIFS
      if (
        tmpNotifsUpdated.value &&
        (tmpNotifs.value.journalNotifs || tmpNotifs.value?.insightsNotifs)
      ) {
        await setUserDocValue(tmpNotifs.value);
        tmpNotifsUpdated.value = false;
      }

      if (pushNotifRegistrationToken.value) {
        await setUserDocValue(
          {
            fcmToken: pushNotifRegistrationToken.value,
            fcmTokenUpdatedAt: serverTimestamp(),
          },
          false,
        );
      }

      //save latest timezone
      updateDoc(userDocRef.value, {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      //ANONYMOUS ONBOARDING DATA SAVING IF ANY
      if (tmpPrivacyPolicyConsent.value) {
        tmpPrivacyPolicyConsent.value.acceptedAt = serverTimestamp();
        addDoc(consentsCollRef.value, tmpPrivacyPolicyConsent.value);
        console.log(
          "In moments.js > fetchUser, tmpPrivacyPolicyConsent saved:",
          tmpPrivacyPolicyConsent.value,
        );
      }

      if (tmpTermsOfServiceConsent.value) {
        tmpTermsOfServiceConsent.value.acceptedAt = serverTimestamp();
        addDoc(consentsCollRef.value, tmpTermsOfServiceConsent.value);
        console.log(
          "In moments.js > fetchUser, tmpTermsOfServiceConsent saved:",
          tmpTermsOfServiceConsent.value,
        );
      }

      if (tmpUserIntentionsGroup.value?.length > 0) {
        setUserDocValue(
          { userIntentions: tmpUserIntentionsGroup.value },
          false,
        );
        tmpUserIntentionsGroup.value.forEach((userIntention) => {
          if (userIntention.startsWith("somethingElse:")) {
            setUserProperty(`ui_se`, userIntention.slice(14).slice(0, 36)); //to avoid "User property value is too long. The maximum supported length is 36"
          } else {
            setUserProperty(`ui_${userIntention}`, true);
          }
        });
        logEvent("user_property_set", {
          userIntentions: JSON.stringify(tmpUserIntentionsGroup.value),
        });
      }

      if (tmpLastLoginMethod.value) {
        setUserDocValue({ lastLoginMethod: tmpLastLoginMethod.value });
      }
    } catch (error) {
      console.log("Error in fetchUser", error); //TODO:8 show message asking to connect to internet when offline?
    } finally {
      fetchUserLock.value = false; // Release the lock
    }
  };

  watch(pushNotifRegistrationToken, async (newVal) => {
    console.log(
      "In moments.js > watch pushNotifRegistrationToken, newVal",
      newVal,
      "userDoc.value",
      userDoc.value,
    );
    if (newVal && userDoc.value) {
      await setUserDocValue(
        {
          fcmToken: newVal,
          fcmTokenUpdatedAt: serverTimestamp(),
        },
        false,
      );
    }
  });

  const getSpeechRecoLanguage = computed(() => {
    console.log(
      "In moments.js > computed getSpeechRecoLanguage, returning:",
      userDoc.value?.speechRecoLanguage ||
        userDoc.value?.locale ||
        i18n.global.locale.value ||
        "en-US",
    );
    return (
      userDoc.value?.speechRecoLanguage ||
      userDoc.value?.locale ||
      i18n.global.locale.value ||
      "en-US"
    );
  });

  const updateUser = async (changes) => {
    try {
      if (changes.hasOwnProperty("displayName")) {
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
      console.log("moments.js > error in updateUser: ", error);
      throw error;
    }
  };

  const getDateRangeOkNeedsCounts = computed(() => {
    if (!momentsFetched.value) {
      return null;
    }

    const okNeedsCounts = {};
    dateRangesMonths.value.forEach((month) => {
      okNeedsCounts[month] = momentsColl.value.filter((moment) => {
        return (
          !moment.deleted &&
          isBetweenDates(
            moment.date.toDate(),
            startOfDate(month, "month"),
            endOfDate(month, "month"),
          ) &&
          Object.keys(moment.needs).length > 0 &&
          !moment.needs.Oops &&
          !moment.needs.error
        );
      }).length;

      dateRangesYears.value.forEach((year) => {
        okNeedsCounts[year] = momentsColl.value.filter((moment) => {
          return (
            !moment.deleted &&
            isBetweenDates(
              moment.date.toDate(),
              startOfDate(year, "year"),
              endOfDate(year, "year"),
            ) &&
            Object.keys(moment.needs).length > 0 &&
            !moment.needs.Oops &&
            !moment.needs.error
          );
        }).length;
      });
    });

    return okNeedsCounts;
  });

  const momentsCollLength = computed(() => {
    if (!momentsFetched.value) {
      return null;
    }

    return momentsColl.value.filter((moment) => !moment.deleted).length;
  });

  const hasNeeds = (momentDocData) => {
    return !(
      !momentDocData.needs ||
      Object.keys(momentDocData.needs).length === 0 ||
      momentDocData.needs.Oops ||
      momentDocData.needs.error
    );
  };

  const deleteMoment = async (momentId) => {
    try {
      console.log("In moment.js > deleteMoment for momentId:", momentId);
      const momentDocRef = doc(momentsCollRef.value, momentId);
      const momentDocSnapshot = await getDoc(momentDocRef);
      console.log(
        "momentDocSnapshot",
        momentDocSnapshot,
        "momentDocSnapshot.data()",
        momentDocSnapshot.data(),
      );
      const otherMomsHaveNeeds = momentsColl.value.some((momentDoc) => {
        console.log(
          "In moments.js > deleteMoment >otherMomsHaveNeeds, momentDoc:",
          momentDoc,
          "momentDoc.id",
          momentDoc.id,
          "momentDoc.deleted",
          momentDoc.deleted,
        );
        return (
          momentDoc.id !== momentId && !momentDoc.deleted && hasNeeds(momentDoc)
        );
      });

      console.log(
        "In moments.js > deleteMoment, momentDocRef:",
        momentDocRef,
        "momentDocSnapshot.data():",
        momentDocSnapshot.data(),
        "momentsCollLength:",
        momentsCollLength.value,
        "otherMomsHaveNeeds:",
        otherMomsHaveNeeds,
      );

      const batch = writeBatch(db);

      //instead of deleting just set the flag deleted to true
      batch.update(momentDocRef, { deleted: true });

      // Prepare the updates for userDocRef
      const userDocUpdates = {
        momentsCount: increment(-1),
        momentsDeletedCount: increment(1),
      };
      // If the moment has needs, decrement momentsWithNeedsCount
      if (hasNeeds(momentDocSnapshot.data())) {
        userDocUpdates.momentsWithNeedsCount = increment(-1);
      }
      if (!otherMomsHaveNeeds) {
        userDocUpdates.welcomeTutorialStep =
          momentsCollLength.value < 2 ? 0 : 1;
        userDocUpdates.hasNeeds = false;
      }

      batch.update(userDocRef.value, userDocUpdates);

      logEvent("moment_deleted");

      await batch.commit();

      //TODO:5 batch to also add momid and momarchive to list of deleted moments in user doc so that it can be used for retries
      if (navigator.onLine) {
        Notify.create(i18n.global.t("momentDeleted"));
      } else {
        Notify.create(i18n.global.t("momentDeletedOffline"));
      }

      const idToken = await user.value.getIdToken(/* forceRefresh */ true);
      console.log(
        "In deleteMoment, will trigger aggDataNeeds recalculation bec. deletion of mom:",
        momentId,
      );
      const response = await axios.post(
        `/api/learn/delete-moment/`,
        {
          momentId,
        },
        {
          headers: {
            authorization: `Bearer ${idToken}`,
          },
        },
      );
      console.log("In deleteMoment", response.data);
      await fetchAggDataNeeds(true /*force*/); //to get the aggDataNeeds update if older period
      // TODO:2 this is a bit overkill, we could just update the relevant aggregate docs
      // Notify.create("Insights recalculation complete.");
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
      moment.deleted = false;

      // Add the new moment in momentsColl (note addDoc not working as per https://github.com/firebase/firebase-js-sdk/issues/5549#issuecomment-1043389401)
      const batch = writeBatch(db);

      const newMomDocRef = doc(momentsCollRef.value);
      batch.set(newMomDocRef, moment);

      batch.update(userDocRef.value, {
        momentsCount: increment(1),
      });

      await batch.commit();

      logEvent("moment_added");

      if (navigator.onLine) {
        Notify.create(i18n.global.t("momentSaved"));
      } else {
        Notify.create(i18n.global.t("momentSavedOffline"));
      }

      if (
        !userDoc.value.welcomeTutorialStep ||
        userDoc.value.welcomeTutorialStep === 0
      )
        await setUserDocValue({ welcomeTutorialStep: 1 });

      //LLM NEEDS ASSESSMENT (due to being in async func, this only runs when/if the previous await are resolved and only if it is also fulfilled as otherwise the try/catch will catch the error and the code will not continue to run)
      //WARNING the following may take up to 30s to complete if bad connection, replies, llm hallucinations OR never complete
      const idToken = await user.value.getIdToken(/* forceRefresh */ true);
      console.log("In addMoment, triggering call to llm for:", moment);
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

      console.log(
        "In addMoment /api/learn/add-moment/ response:",
        response.data,
      );
      //if response doesn't contain message field throw an error
      if (!response.data.message) {
        throw new Error(
          "In addMoment > Error in response from llm, response.data:",
          response.data,
        );
      }
      logEvent("moment_needs_analyzed");

      // Notify.create("Needs analysis complete.");
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

        onSnapshot(doc(momentsCollRef.value, momentId), (snapshot) => {
          momentRef.value = snapshot.data();
        });
      } catch (error) {
        console.log("Error in getMomentById", error);
      }
    };
  });

  const getLatestMomWithNeedsId = computed(() => {
    if (
      !momentsFetched.value ||
      !userDoc.value.hasNeeds || // return null if user has no needs to block welcome tuto button "View needs"
      !momentsCollLength.value
    ) {
      return;
    }
    const sortedMoms = [...momentsColl.value].sort(
      (a, b) => b.date.seconds - a.date.seconds,
    );

    // Filter moments to include only those whose 'needs' object exists is not 'Oops'
    const filteredMoms = sortedMoms.filter(
      (moment) =>
        !moment.deleted &&
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

  const fetchAggDataNeeds = async (force = false) => {
    try {
      if (!force && aggDataNeedsFetched.value) {
        console.log("In fetchAggDataNeeds, already aggDataNeedsFetched");
        return;
      }
      if (!userFetched.value) {
        console.log(
          "In moment.js > fetchAggDataNeeds: User not yet fetched, fetching it",
        );
        await fetchUser();
      }

      //AGGDATANEEDS
      onSnapshot(doc(aggYearlyCollRef.value, currentYear.value), (snapshot) => {
        aggDataNeeds.value[currentYear.value] = snapshot.data();
      });

      onSnapshot(
        doc(aggMonthlyCollRef.value, currentYYYYdMM.value),
        (snapshot) => {
          aggDataNeeds.value[currentYYYYdMM.value] = snapshot.data();
        },
      );

      //TODO:2 first try getDocsFromCache, if fails then getDocsFromServer
      getDocs(aggYearlyCollRef.value).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.id.length === 4 && doc.id !== currentYear.value) {
            aggDataNeeds.value[doc.id] = doc.data();
            // needsAggregatePrevYears.value[doc.id] = ref(doc.data());
          }
        });
      });

      getDocs(aggMonthlyCollRef.value).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.id.length === 7 && doc.id !== currentYYYYdMM.value) {
            aggDataNeeds.value[doc.id] = doc.data();
          }
        });
      });

      aggDataNeedsFetched.value = true;
      console.log(
        "In fetchAggDataNeeds, aggDataNeeds.value:",
        aggDataNeeds.value,
      );
    } catch (error) {
      console.log("Error in fetchAggDataNeeds", error);
    }
  };

  const fetchAggDataInsights = async (force = false) => {
    try {
      if (!force && aggDataInsightsFetched.value) {
        console.log("In fetchAggDataInsights, already aggDataInsightsFetched");
        return;
      }
      if (!userFetched.value) {
        console.log(
          "In moment.js > fetchAggDataInsights: User not yet fetched, fetching it",
        );
        await fetchUser();
      }

      onSnapshot(
        doc(aggYearlyCollRef.value, `${currentYear.value}-insights`),
        (snapshot) => {
          aggDataInsights.value[currentYear.value] = snapshot.data();
        },
      );

      onSnapshot(
        doc(aggMonthlyCollRef.value, `${currentYYYYdMM.value}-insights`),
        async (snapshot) => {
          aggDataInsights.value[currentYYYYdMM.value] = snapshot.data();
        },
      );

      getDocs(aggYearlyCollRef.value).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (
            doc.id.endsWith("-insights") &&
            doc.id !== `${currentYear.value}-insights`
          ) {
            aggDataInsights.value[doc.id.split("-")[0]] = doc.data();
          }
        });
      });

      getDocs(aggMonthlyCollRef.value).then((querySnapshot) => {
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

      aggDataInsightsFetched.value = true;
      console.log(
        "In fetchAggDataInsights, aggDataInsights.value:",
        aggDataInsights.value,
      );
    } catch (error) {
      console.log("Error in fetchAggDataInsights", error);
    }
  };

  //DATES
  const getSortedMomsFromDayAndNeed = /*async*/ (day, need = "") => {
    // if (!momentsFetched.value) {
    //   await fetchMoments();
    // }
    // console.log("In getSortedMomsFromDayAndNeed");
    const dayDate = dayToDate(day);

    let moms = momentsColl.value.filter(
      (moment) =>
        !moment.deleted && isSameDate(moment.date.toDate(), dayDate, "day"),
    );

    if (need) {
      moms = moms.filter((moment) => moment.needs[need]);
    }

    return moms?.sort((a, b) => b.date.seconds - a.date.seconds);
  };

  const setUserDocValue = async (value, setAnalytics = true) => {
    console.log("In moment.js > setUserDocValue for value", value);
    try {
      if (!userFetched.value) {
        await fetchUser();
      }
      await setDoc(userDocRef.value, { ...value }, { merge: true });

      if (setAnalytics) {
        for (const [key, val] of Object.entries(value)) {
          setUserProperty(key, val);
          logEvent("user_property_set", { [key]: val });
        }
      }
    } catch (error) {
      console.log(
        "In moment.js > Error in setUserDocValue for value",
        value,
        ",error:",
        error,
      );
    }
  };

  const setAggDataInsightsValue = async (YYYYdMM, value) => {
    console.log("In moment.js > setAggDataInsights for value", value);
    try {
      await setDoc(
        doc(aggMonthlyCollRef.value, `${YYYYdMM}-insights`),
        { ...value },
        { merge: true },
      );
    } catch (error) {
      console.log(
        "In moment.js > Error in setAggDataInsights for value",
        value,
        ",error:",
        error,
      );
    }
  };

  const getRandomMomentIdOfTheDay = async (
    mood = "happy",
    atLeastWeeks = 3,
  ) => {
    // Check if today's date is different from the last revisit date
    // console.log(
    //   "In moments.js > getRandomMomentIdOfTheDay, userDoc.value.revisitMoment:",
    //   userDoc.value.revisitMoment,
    //   "currentDate.value:",
    //   currentDate.value,
    // );
    if (
      userDoc.value.revisitMoment &&
      isSameDate(
        userDoc.value.revisitMoment.date.toDate(),
        currentDate.value,
        "day",
      )
    ) {
      // console.log(
      //   "In moments.js > getRandomMomentIdOfTheDay, userDoc.value.revisitMoment.date === currentDate.value, returning:",
      //   userDoc.value.revisitMoment.id,
      // );
      return userDoc.value.revisitMoment.id; // Return the cached ID
    }

    const weeksAgo = new Date();
    weeksAgo.setDate(weeksAgo.getDate() - atLeastWeeks * 7); // Subtract weeks

    const filteredMoments = momentsColl.value.filter((moment) => {
      const momentDate = moment.date.toDate();
      if (
        !moment.deleted &&
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
      await setUserDocValue({
        revisitMoment: {
          id: filteredMoments[randomIndex].id,
          date: currentDate.value,
        },
      });
      return filteredMoments[randomIndex].id;
    }

    return null;
  };

  //get a random quote but keep it for the day, so there should be no change on refresh it a given day
  const getPlaceholderQuoteOfTheDayId = async (quoteListLength = 11) => {
    // t('inspirationalQuotes').length
    // Check if today's date is different from the last revisit date
    if (
      userDoc.value.placeholderQuote &&
      isSameDate(
        userDoc.value.placeholderQuote.date.toDate(),
        currentDate.value,
        "day",
      )
    ) {
      return userDoc.value.placeholderQuote.id; // Return the cached ID
    }

    const randomQuoteIndex = Math.floor(Math.random() * (quoteListLength - 1));
    await setUserDocValue({
      placeholderQuote: {
        id: randomQuoteIndex,
        date: currentDate.value,
      },
    });
    return randomQuoteIndex;
  };

  function $reset() {
    user.value = null;
    userDocRef.value = null;
    userDoc.value = null;
    fetchUserLock.value = false;
    userFetched.value = false;
    momentsCollRef.value = null;
    momentsColl.value = [];
    momentsFetched.value = false;
    aggMonthlyCollRef.value = null;
    aggYearlyCollRef.value = null;
    aggDataNeeds.value = {};
    aggDataInsights.value = {};
    aggDataNeedsFetched.value = false;
    aggDataInsightsFetched.value = false;
    donutSegmentClicked.value = null;
    firstOnSnapshotDone.value = false;
    needsToggleModel.value = "top";
    activeIndex.value = null;
    segDateId.value = "Monthly";
    newMomText.value = "";
    pickedDateYYYYsMMsDD.value = formatDate(currentDate.value, "YYYY/MM/DD");
    tmpPrivacyCheckboxState.value = false;
    tmpPrivacyPolicyConsent.value = null;
    tmpTermsOfServiceConsent.value = null;
    consentsCollRef.value = null;
    tmpUserIntentionsGroup.value = [];
    tmpUIsomethingElse.value = "";
    tmpNotifs.value = {
      journalNotifs: true,
      insightsNotifs: true,
      journalNotifsTime: currentHHmmRoundedTo15.value,
    };
    tmpNotifsUpdated.value = false;
    tmpLastLoginMethod.value = "";
  }

  return {
    user,
    tmpPrivacyCheckboxState,
    tmpPrivacyPolicyConsent,
    tmpUserIntentionsGroup,
    tmpUIsomethingElse,
    tmpNotifs,
    tmpNotifsUpdated,
    tmpTermsOfServiceConsent,
    tmpLastLoginMethod,
    userDoc,
    userFetched,
    momentsFetched,
    donutSegmentClicked,
    needsToggleModel,
    activeIndex,
    segDateId,
    newMomText,
    getActiveDateRange,
    getPrevDateRange,
    getDateRanges,
    pickedDateYYYYsMMsDD,
    getUniqueDaysTs,
    getOldestMomentDate,
    getOldestMomentDateYYYYsMM,
    getMomentById,
    getLatestMomWithNeedsId,
    aggDataNeeds,
    aggDataInsights,
    aggDataNeedsFetched,
    aggDataInsightsFetched,
    getDateRangeOkNeedsCounts,
    getSpeechRecoLanguage,
    fetchUser,
    updateUser,
    setUserDocValue,
    fetchMoments,
    addMoment,
    deleteMoment,
    fetchAggDataNeeds,
    fetchAggDataInsights,
    getUniqueDaysDateFromDateRangeAndNeed,
    getSortedMomsFromDayAndNeed,
    getRandomMomentIdOfTheDay,
    getPlaceholderQuoteOfTheDayId,
    setAggDataInsightsValue,
    resetToCurrentMonth,
    $reset,
  };
});

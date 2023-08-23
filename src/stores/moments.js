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
  const momentsCollRef = ref(null);
  const momentsColl = ref([]);
  const tagsColl = ref([]);
  const aggregateAllTimeColl = ref([]);
  const aggregateYearlyColl = ref([]);
  const aggregateMonthlyColl = ref([]);
  const initialized = ref(false);
  const isEditorFocused = ref(false);
  const needsMap = {
    "Physical Safety": "Physical Safety 🛡️",
    Food: "Food 🥦",
    Shelter: "Shelter 🏠",
    "Financial Security": "Financial Security 💰",
    "Rest & Relaxation": "Rest & Relaxation 🌙",
    Comfort: "Comfort 🛋️",
    "Physical Movement": "Physical Movement 🤸",
    "Physical Touch": "Physical Touch 👐",
    "Sexual Expression": "Sexual Expression 💋",
    "Contact with Nature": "Contact with Nature 🏞️",
    "Social Connection": "Social Connection 👥",
    "Belongingness & Community": "Belongingness & Community 🏘️",
    "Empathy, Understanding & Validation":
      "Empathy, Understanding & Validation 👂",
    "Affection, Love & Intimacy": "Affection, Love & Intimacy ❤️",
    "Emotional Safety & Well-Being": "Emotional Safety & Well-Being 🤗",
    "Personal Privacy": "Personal Privacy 🚪",
    "Personal Autonomy": "Personal Autonomy 🛤️",
    "Self-Esteem & Social Recognition": "Self-Esteem & Social Recognition 💪",
    Competence: "Competence 🏆",
    Efficiency: "Efficiency ⚡",
    "Societal Contribution": "Societal Contribution 🔧",
    "Personal Expression & Creativity": "Personal Expression & Creativity 🎨",
    Exploration: "Exploration 🌎",
    Inspiration: "Inspiration💡",
    Learning: "Learning 📚",
    "Self-Actualization": "Self-Actualization 🌱",
    Challenge: "Challenge ⛰️",
    Novelty: "Novelty 🌀",
    Entertainment: "Entertainment 🎠",
    Humor: "Humor 😂",
    Play: "Play ⚽",
    "Moral Integrity": "Moral Integrity 🕊️",
    "Social Justice": "Social Justice ⚖️",
    "Order & Structure": "Order & Structure 📐",
    Altruism: "Altruism 🤲",
    "Life's Meaning & Purpose": "Life's Meaning & Purpose 🌌",
    "Joyful Celebration": "Joyful Celebration 🎉",
    "Grieving & Mourning": "Grieving & Mourning 🥀",
    "Inner Peace": "Inner Peace 🧘‍♂️",
    "Spiritual Transcendence": "Spiritual Transcendence 🌸",
  };

  //TODO:2 separate betw local state and firestore so that directly after mom insertion the state is updated and only if fs save is failed is it reverted? I.e. "Optimistic UI Update with Revert" ?
  const fetchMoments = async () => {
    if (initialized.value) {
      console.log("XXX in fetchMoments, already initialized");
      return;
    }
    try {
      user.value = await getCurrentUser();
      userDocRef.value = doc(db, "users", `${user.value.uid}`);

      // Check if user doc exists, if not create & initialize it
      const userDocCheck = await getDoc(userDocRef.value);
      if (!userDocCheck.exists()) {
        console.log("User doc does not exist, creating it");
        await setDoc(userDocRef.value, {
          momentsDays: [],
        });
      }
      userDoc.value = useDocument(userDocRef);

      momentsCollRef.value = collection(db, `users/${user.value.uid}/moments`);
      momentsColl.value = useCollection(momentsCollRef);
      tagsColl.value = useCollection(
        collection(db, `users/${user.value.uid}/tags`),
      );
      aggregateAllTimeColl.value = useCollection(
        collection(db, `users/${user.value.uid}/aggregateAllTime`),
      );
      aggregateYearlyColl.value = useCollection(
        collection(db, `users/${user.value.uid}/aggregateYearly`),
      );
      aggregateMonthlyColl.value = useCollection(
        collection(db, `users/${user.value.uid}/aggregateMonthly`),
      );
      initialized.value = true;
    } catch (error) {
      console.log("Error in fetchMoments", error);
    }
  };

  //LLM CALL RETRIES: at each start of the app, look for up to 3 moments with empty needsImportances have not been rated and retry the LLM call
  const emptyNeedsMomentsRetry = async () => {
    // Query moments where needsImportances is empty
    const emptyNeedsImportancesQuery = query(
      momentsCollRef.value,
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
        "XXX in fetchMoments, emptyNeedsImportancesQuery returned:",
        doc.data(),
      );

      await updateDoc(doc.ref, {
        retries: increment(1),
      });
      const idToken = await user.value.getIdToken(/* forceRefresh */ true);
      console.log("TRIGGERING RETRY CALL TO LLM FOR moment", doc.data().text);
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
        "SUCCESSFUL RETRY LLM RESPONSE for moment '",
        doc.data().text,
        "' :",
        response.data,
      );
    }
  };

  const addMoment = async (moment) => {
    console.log("XXX in addMoment, moment:", moment);
    try {
      const batch = writeBatch(db);

      // Add the new moment in momentsColl (note addDoc not working as per https://github.com/firebase/firebase-js-sdk/issues/5549#issuecomment-1043389401)
      const docRef = doc(momentsCollRef.value);
      batch.set(docRef, moment);
      batch.update(docRef, { needsImportances: {}, retries: 0 });

      // Update the tag statistics in tagsColl for the tags of the new moment
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
        if (tagDoc.exists())
          batch.update(tagDocRef, { tagMoments: arrayUnion(tagData) });
        else batch.set(tagDocRef, { tagMoments: [tagData] });
      }

      // Remove moment.date time and save the Timestamp to momentsDays array in userDoc
      // console.log("XXX in addMoment, moment.date:", moment.date);
      const ts = new Timestamp(moment.date.seconds, moment.date.nanoseconds);
      const dateObj = ts.toDate();
      dateObj.setHours(0, 0, 0, 0);
      // console.log("XXX in addMoment, dateWithoutTime:", dateObj);
      batch.update(userDocRef.value, {
        momentsDays: arrayUnion(Timestamp.fromDate(dateObj)),
      });

      await batch.commit();

      //LLM NEEDS ASSESSMENT (due to being in async func, this only runs when/if the await batch.commit() is resolved and only if it is also fulfilled as otherwise the try/catch will catch the error and the code will not continue to run)
      //WARNING the following may take up to 30s to complete if bad connection, replies, llm hallucinations OR never complete
      const idToken = await user.value.getIdToken(/* forceRefresh */ true);
      console.log("TRIGGERING CALL TO LLM FOR moment", docRef.id, moment.text);
      const response = await axios.get(`/api/learn/needs/`, {
        params: {
          momentText: moment.text,
          momentDate: JSON.stringify(moment.date),
          momentId: docRef.id,
        },
        headers: {
          authorization: `Bearer ${idToken}`,
        },
      });
      console.log(
        "SUCCESSFUL LLM RESPONSE for moment '",
        docRef.id,
        moment.text,
        "' :",
        response.data,
      );
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

  const uniqueDays = computed(() => {
    if (!(userDoc?.value?.data?.momentsDays?.length ?? 0)) {
      console.log(
        "In momentsStore uniqueDays: empty uniqueDays bec. of userDoc?.value?.data?.momentsDays?.length",
      );
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

  const getNeeds = (
    dateRange = "all", //a string of format xxx, YYYY or YYYY-MM
    filterBy = "all", //TODO:3 support checking presence of unsatisfied/satisfied needs
    sortBy = "unsatisfactionImpactValue",
    descending = true,
  ) => {
    return computed(() => {
      if (
        !aggregateAllTimeColl.value ||
        !aggregateAllTimeColl.value.data ||
        aggregateAllTimeColl.value.data.length === 0
      ) {
        return [];
      }

      // firestore aggregateDoc structure
      // nMoments: 0,
      // needs: {need1: { importanceSum: 0, satisfactionSum: 0, occurrenceCount: 0 }, need2: { importanceSum: 0, satisfactionSum: 0, occurrenceCount: 0 }, ...}
      // totalNeedsImportanceSum: 0,
      // lastUpdate: FieldValue.serverTimestamp(),

      //if dateRange is of format YYYY, return the related yearly needs
      console.log("XXX in getNeeds, dateRange:", dateRange);

      if (dateRange === "all") {
        //TODO: 3
      }

      if (dateRange.length === 4) {
        const aggregateDoc = useDocument(
          doc(db, "users", `${user.value.uid}`, "aggregateYearly", dateRange),
        );
        console.log("XXX in getNeeds aggregateDoc", aggregateDoc);
        console.log("XXX in getNeeds aggregateDoc.needs", aggregateDoc.needs);

        let maxImportanceValue = 0;
        let needsList = aggregateDoc.needs.map((need) => {
          //TODO:3 extract of the if
          if (need.occurenceCount === 0) return;
          const importanceValue =
            need.importanceSum / aggregateDoc.totalNeedsImportanceSum;
          if (importanceValue > maxImportanceValue)
            maxImportanceValue = importanceValue;
          // const satisfactionValue = need.satisfactionSum / need.occurenceCount;
          // const satisfactionImpactValue = importanceValue * satisfactionValue
          // const unsatisfactionImpactValue = importanceValue * (1 - satisfactionValue)

          return {
            displayId: needsMap[need],
            count: need.occurenceCount,
            importanceValue: importanceValue,
            // satisfactionValue: satisfactionValue
            // satisfactionImpactValue: satisfactionImpactValue,
            // unsatisfactionImpactValue: unsatisfactionImpactValue,
          };
        });

        needsList = needsList.map((need) => {
          const importanceDisplayValue =
            need.importanceValue / maxImportanceValue;
          return {
            ...need,
            importanceDisplayValue: importanceDisplayValue,
            // satisfactionImpactDisplayValue:
            //   importanceDisplayValue * need.satisfactionValue,
            // unsatisfactionImpactDisplayValue:
            //   importanceDisplayValue * (1-need.satisfactionValue),
          };
        });

        //sort the array in descending or ascending "sortBy" order
        descending
          ? needsList.sort((a, b) => b[sortBy] - a[sortBy])
          : needsList.sort((a, b) => a[sortBy] - b[sortBy]);
      }

      //if dateRange is of format YYYY-MM, return the related monthly needs
      if (dateRange.length === 7) {
        //TODO:3
      }

      return needsList;
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
    isEditorFocused,
    uniqueTags,
    uniqueDays,
    initialized,
    getTags,
    getNeeds,
    addMoment,
    fetchMoments,
    updateUser,
    setIsEditorFocused,
    emptyNeedsMomentsRetry,
  };
});

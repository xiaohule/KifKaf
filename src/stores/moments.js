import { defineStore } from "pinia";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useCollection, getCurrentUser } from "vuefire";
import { db } from "../boot/firebaseBoot.js";
import { ref, computed } from "vue";
import { date } from "quasar";
// destructuring to keep only what is needed in date
const { formatDate } = date;

export const useMomentsStore = defineStore("moments", () => {
  const user = ref(null);
  const momentsRef = ref(null);
  const moments = ref([]);
  const initialized = ref(false);
  const isEditorFocused = ref(false);

  //TODO: separate betw local state and firestore?
  const fetchMoments = async () => {
    try {
      user.value = await getCurrentUser();
      // console.log("User accessed from moments store", user.value);
      // user.value.uid;
      // user.value.displayName;
      // user.value.email;
      // user.value.photoURL;

      momentsRef.value = collection(db, `users/${user.value.uid}/moments`);
      moments.value = useCollection(momentsRef);
      initialized.value = true;
    } catch (error) {
      console.log("Could not get  current user", error);
    }
  };

  //TODO: improve perf
  const uniqueTags = computed(() => {
    if (
      !moments.value ||
      !moments.value.data ||
      moments.value.data.length === 0
    )
      return [];

    const uniqueTagsSet = new Set();
    moments.value.data.forEach((moment) => {
      moment.tags.forEach((tag) => {
        uniqueTagsSet.add(tag);
      });
    });
    return [...uniqueTagsSet];
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
      const docRef = await addDoc(momentsRef.value, moment);
      // Add the new moment to the local state as well
      // this.moments.push({ ...moment }); //removed because was creating a duplicate
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
    setIsEditorFocused,
  };
});

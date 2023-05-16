import { defineStore } from "pinia";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useCollection } from "vuefire";
import { db } from "../boot/setup.js";
import { ref, computed } from "vue";

export const useMomentsStore = defineStore("moments", () => {
  // const userId = ref("jdouet"); //TODO make it dynami
  // const momentsRef = collection(db, `users/${userId.value}/moments`);
  // const moments = useCollection(momentsRef);

  const momentsRef = ref(null);
  const moments = ref([]);
  const userId = ref("");

  //TODO when i will want to have a clean separation betw local state and firestore i will need to remove the use of vuefire
  const fetchMoments = (uid) => {
    try {
      userId.value = uid;
      momentsRef.value = collection(db, `users/${userId.value}/moments`);
      moments.value = useCollection(momentsRef);
      console.log("moments.value from FETCH", moments.value);
    } catch (error) {
      console.log(error);
    }
  };

  const uniqueDays = computed(() => {
    const days = moments.value.data.map((moment) => {
      // Convert Firestore Timestamp to JavaScript Date
      console.log("moment_i.text", moment.text);
      console.log("moment_i.date", moment.date);
      const ts = new Timestamp(moment.date.seconds, moment.date.nanoseconds);
      // const date = Date(moment.date.seconds);
      const date = ts.toDate();
      // Remove time
      date.setHours(0, 0, 0, 0);
      console.log("moment_i.getTime", date.getTime());
      return date.getTime();
    });
    const uniqueDaysTemp = [...new Set(days)];
    // Convert back to Date objects
    return uniqueDaysTemp.map((day) => new Date(day));
  });

  const addMoment = async (moment) => {
    try {
      const docRef = await addDoc(momentsRef.value, moment); //TODO readd .value?
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
  return { momentsRef, moments, userId, uniqueDays, addMoment, fetchMoments };
});

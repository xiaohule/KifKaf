// src/composables/dateUtils.js
import { computed } from "vue";
import { Timestamp } from "firebase/firestore";
import { date } from "quasar";
const { formatDate, isSameDate } = date;

export function useDateUtils() {
  const currentDate = computed(() => new Date());

  const currentMonth = computed(() =>
    (currentDate.value.getMonth() + 1).toString().padStart(2, "0"),
  );

  const currentYear = computed(() => currentDate.value.getFullYear());

  const currentYYYYdMM = computed(() => {
    return `${currentYear.value}-${currentMonth.value}`;
  });

  const currentDateYYYYsMM = computed(() => {
    return formatDate(currentDate.value, "YYYY/MM");
  });

  const getGreetingLabel = computed(() => {
    // Get the current hour using the Date object
    const hour = currentDate.value.getHours();
    // Determine the greeting based on the hour
    if (hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour <= 17) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  });

  const getDatePickerLabel = (dateRange) => {
    console.log("In dateUtils.js > getDatePickerLabel, dateRange:", dateRange);
    if (!dateRange) {
      return;
    }
    const periodicity =
      dateRange.split("-").length === 1 ? "Yearly" : "Monthly";
    if (periodicity === "Yearly") {
      return dateRange == currentYear.value
        ? "This year"
        : dateRange.toString();
    } else if (periodicity === "Monthly") {
      if (dateRange == currentYYYYdMM.value) {
        return "This month";
      } else {
        const [yearStr, monthStr] = dateRange.split("-");
        const dateRangesMonthsDate = new Date(
          Number(yearStr),
          Number(monthStr) - 1,
        );
        return dateRangesMonthsDate.getFullYear() ===
          currentDate.value.getFullYear()
          ? formatDate(dateRangesMonthsDate, "MMMM")
          : formatDate(dateRangesMonthsDate, "MMMM YYYY");
      }
    }
  };

  const dayToDate = (day) => {
    // console.log(
    //   "In dateUtils.js > dayToDate, day:",
    //   day,
    //   "typeof day",
    //   typeof day,
    // );
    if (!day) {
      return;
    }
    let dayDate = day;
    if (dayDate instanceof Timestamp) {
      //Timestamp {seconds: 1679961600, nanoseconds: 0}
      dayDate = day.toDate();
    } else if (typeof dayDate === "number") {
      dayDate = new Timestamp(day, 0).toDate(); //Tue Mar 28 2023 02:00:00 GMT+0200 (Central European Summer Time)
    }
    return dayDate;
  };

  const formatDayForMomList = (day, showHour = false /*forDisplay = true*/) => {
    if (!day) {
      return;
    }

    const dayDate = dayToDate(day);

    // if (!forDisplay) return formatDate(dayDate, "MMMM D, YYYY");

    const displayDay = isSameDate(dayDate, currentDate.value, "day")
      ? "Today"
      : isSameDate(dayDate, currentDate.value - 86400000, "day")
        ? "Yesterday"
        : isSameDate(dayDate, currentDate.value, "year")
          ? formatDate(dayDate, "MMMM D")
          : formatDate(dayDate, "MMMM D, YYYY");

    // console.log("In dateUtils.js > formatDayForMomList, displayDay:", displayDay);
    if (showHour) return displayDay + ", " + formatDate(dayDate, "HH:mm");
    else return displayDay;
  };

  return {
    currentDate,
    currentMonth,
    currentYear,
    currentYYYYdMM,
    currentDateYYYYsMM,
    getGreetingLabel,
    getDatePickerLabel,
    dayToDate,
    formatDayForMomList,
  };
}

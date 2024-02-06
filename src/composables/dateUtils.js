// src/composables/dateUtils.js
import { computed } from "vue";
import { Timestamp } from "firebase/firestore";
import { date } from "quasar";
const { formatDate, isSameDate, getDateDiff } = date;

export function useDateUtils() {
  const currentDate = computed(() => new Date());

  const currentMonth = computed(() =>
    (currentDate.value.getMonth() + 1).toString().padStart(2, "0"),
  );

  const currentYear = computed(() =>
    currentDate.value.getFullYear().toString(),
  );

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
      return "goodMorning";
    } else if (hour >= 12 && hour <= 17) {
      return "goodAfternoon";
    } else {
      return "goodEvening";
    }
  });

  const getDatePickerLabel = (dateRange, t) => {
    console.log("In dateUtils.js > getDatePickerLabel, dateRange:", dateRange);
    if (!dateRange) {
      return t("thisMonth");
    }
    const periodicity =
      dateRange.split("-").length === 1 ? "Yearly" : "Monthly";
    if (periodicity === "Yearly") {
      return dateRange == currentYear.value
        ? t("thisYear")
        : dateRange.toString();
    } else if (periodicity === "Monthly") {
      if (dateRange == currentYYYYdMM.value) {
        return t("thisMonth");
      } else {
        const [yearStr, monthStr] = dateRange.split("-");
        const monthName = t("monthsList." + monthStr);
        const isCurrentYear = yearStr === currentYear.value.toString();

        return isCurrentYear ? monthName : `${monthName} ${yearStr}`;
      }
    }
  };

  const isDatePickerLabelCurrent = (dateRange) => {
    if (!dateRange) {
      return true;
    }
    const periodicity =
      dateRange.split("-").length === 1 ? "Yearly" : "Monthly";
    if (periodicity === "Yearly") {
      return dateRange == currentYear.value ? true : false;
    } else if (periodicity === "Monthly") {
      return dateRange == currentYYYYdMM.value ? true : false;
    } else return false;
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

  const formatDayForMomList = (
    day,
    showHour = false /*forDisplay = true*/,
    t,
  ) => {
    if (!day) {
      return;
    }
    // console.log("in formatDayForMomList");
    const dayDate = dayToDate(day);

    const dayOfWeek = dayDate.getDay(); // Returns day of week (0 for Sunday, 1 for Monday, etc.)
    const dayOfMonth = String(dayDate.getDate());
    const month = String(dayDate.getMonth() + 1).padStart(2, "0"); // getMonth() is zero-based
    const year = dayDate.getFullYear();

    // Translate days and months using your lists
    const translatedDayOfWeek = t(`daysList.${dayOfWeek}`);
    const translatedMonth = t(`monthsList.${month}`).toLowerCase();

    let displayDay;

    if (isSameDate(dayDate, currentDate.value, "day")) {
      displayDay = t("today");
    } else if (
      isSameDate(
        dayDate,
        new Date(currentDate.value.getTime() - 86400000),
        "day",
      )
    ) {
      displayDay = t("yesterday");
    } else if (isSameDate(dayDate, currentDate.value, "year")) {
      displayDay = `${translatedDayOfWeek} ${dayOfMonth} ${translatedMonth}`;
    } else {
      displayDay = `${translatedDayOfWeek} ${dayOfMonth} ${translatedMonth} ${year}`;
    }

    // console.log("In dateUtils.js > formatDayForMomList, displayDay:", displayDay);
    if (showHour) return displayDay + ", " + formatDate(dayDate, "HH:mm");
    else return displayDay;
  };

  const formatRevisitDay = (day, t) => {
    if (!day) {
      return;
    }
    console.log("in dateUtils.js >  formatRevisitDay");

    const dayDate = dayToDate(day);
    const diffInDays = Math.abs(getDateDiff(currentDate.value, dayDate, "day"));
    const diffInMonths = Math.abs(
      getDateDiff(currentDate.value, dayDate, "month"),
    );
    const diffInYears = Math.abs(
      getDateDiff(currentDate.value, dayDate, "year"),
    );

    const timeAgo =
      diffInDays < 31
        ? t("weeksAgo", Math.floor(diffInDays / 7))
        : diffInMonths < 12
          ? t("monthsAgo", diffInMonths)
          : t("yearsAgo", diffInYears);

    // console.log("In dateUtils.js > formatDayForMomList, displayDay:", displayDay);
    return timeAgo;
  };

  const monthDateRangeToDate = (monthDateRange) => {
    console.log(
      "In dateUtils > monthDateRangeToDate, monthDateRange",
      monthDateRange,
    );
    const [yearStr, monthStr] = monthDateRange.split("-");
    return new Date(Number(yearStr), Number(monthStr) - 1);
  };

  return {
    currentDate,
    currentMonth,
    currentYear,
    currentYYYYdMM,
    currentDateYYYYsMM,
    getGreetingLabel,
    getDatePickerLabel,
    isDatePickerLabelCurrent,
    dayToDate,
    formatDayForMomList,
    formatRevisitDay,
    monthDateRangeToDate,
  };
}

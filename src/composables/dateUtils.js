// src/composables/dateUtils.js
import { computed } from "vue";
import { date } from "quasar";
const { formatDate, getDateDiff, startOfDate, addToDate, getMaxDate } = date;

export function useCurrentDates() {
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

  return {
    currentDate,
    currentMonth,
    currentYear,
    currentYYYYdMM,
    currentDateYYYYsMM,
  };
}

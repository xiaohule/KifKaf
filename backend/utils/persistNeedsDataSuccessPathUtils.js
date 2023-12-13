const { Timestamp, FieldValue } = require("firebase-admin/firestore");
const { needsList } = require("./openaiPromptsUtils");
const {
  generateNewRawData,
  generateNewDisplayData,
} = require("./generateAggregateDataUtils");

const needsInitValues = {
  occurrenceCount: 0,
  satisfactionSum: 0,
  dissatisfactionSum: 0,
  importancesSum: 0,
  satisfactionValue: 0,
  dissatisfactionValue: 0,
  importanceValue: 0,
  satisfactionImpactLabelValue: 0,
  unsatisfactionImpactLabelValue: 0,
};

const needsMap = needsList.reduce((acc, need) => {
  acc[need] = { ...needsInitValues };
  return acc;
}, {});

const initAggregateDoc = async (aggregateDocRef, type = "") => {
  const aggregateDoc = await aggregateDocRef.get();
  const defaultStructure =
    type === "raw"
      ? {
          nMoments: 0,
          totalImportances: 0,
          needs: needsMap,
          totalSatisfactionImpact: 0,
          totalUnsatisfactionImpact: 0,
          lastUpdate: FieldValue.serverTimestamp(),
        }
      : type === "insights"
        ? {
            threadId: "",
            nSuccessRun: 0,
            summary: "",
            quote: { text: "", author: "", why: "" },
            book: { title: "", author: "", why: "" },
            suggestions: { continue: [], stop: [], start: [] },
            lastUpdate: FieldValue.serverTimestamp(),
          }
        : {
            lastUpdate: FieldValue.serverTimestamp(),
          };
  if (!aggregateDoc.exists) {
    // If the document doesn't exist, create it with the default structure
    await aggregateDocRef.set(defaultStructure);
  }
};

const getAggregateDocRefs = async (userDocRef, rawMomentDate) => {
  console.log("getAggregateDocRefs > rawMomentDate:", rawMomentDate);
  let momentDateObject = rawMomentDate;
  if (typeof momentDateObject === "string") {
    momentDateObject = JSON.parse(rawMomentDate);
  }
  const momentTs = new Timestamp(
    momentDateObject.seconds,
    momentDateObject.nanoseconds,
  );
  console.log("getAggregateDocRefs > momentTs:", momentTs);
  const momentDate = momentTs.toDate();
  const momentYear = momentDate.getFullYear().toString();
  const momentMonth = momentDate.getMonth() + 1;
  const momentYearMonth =
    momentYear + "-" + (momentMonth < 10 ? "0" : "") + momentMonth;

  const aggregateYearlyRawDocRef = userDocRef
    .collection("aggregateYearly")
    .doc(`${momentYear}-raw`);
  const aggregateMonthlyRawDocRef = userDocRef
    .collection("aggregateMonthly")
    .doc(`${momentYearMonth}-raw`);
  const aggregateYearlyDocRef = userDocRef
    .collection("aggregateYearly")
    .doc(momentYear);
  const aggregateMonthlyDocRef = userDocRef
    .collection("aggregateMonthly")
    .doc(momentYearMonth);
  await Promise.all([
    initAggregateDoc(aggregateYearlyRawDocRef, "raw"),
    initAggregateDoc(aggregateMonthlyRawDocRef, "raw"),
    initAggregateDoc(aggregateYearlyDocRef),
    initAggregateDoc(aggregateMonthlyDocRef),
  ]);
  return {
    aggregateYearlyRawDocRef,
    aggregateMonthlyRawDocRef,
    aggregateYearlyDocRef,
    aggregateMonthlyDocRef,
  };
};

const persistNeedsData = async (
  db,
  req,
  userDocRef,
  momentDocRef,
  momentNeedsData,
) => {
  //get yearly and monthly aggregate docs
  const {
    aggregateYearlyRawDocRef,
    aggregateMonthlyRawDocRef,
    aggregateYearlyDocRef,
    aggregateMonthlyDocRef,
  } = await getAggregateDocRefs(userDocRef, req.body.momentDate);

  //persist llm data in firestore
  await db.runTransaction(async (t) => {
    const aggregateYearlyRawDoc = await t.get(aggregateYearlyRawDocRef);
    const aggregateMonthlyRawDoc = await t.get(aggregateMonthlyRawDocRef);

    const newYearlyRawData = generateNewRawData(
      aggregateYearlyRawDoc,
      momentNeedsData,
    );
    const newMonthlyRawData = generateNewRawData(
      aggregateMonthlyRawDoc,
      momentNeedsData,
    );

    const newYearlyDisplayData = generateNewDisplayData(newYearlyRawData);
    const newMonthlyDisplayData = generateNewDisplayData(newMonthlyRawData);

    // console.log("In transaction before update, newYearlyDisplayData", newYearlyDisplayData);
    //update aggregate docs
    t.update(aggregateYearlyRawDocRef, newYearlyRawData);
    t.update(aggregateMonthlyRawDocRef, newMonthlyRawData);
    t.update(aggregateYearlyDocRef, newYearlyDisplayData);
    t.update(aggregateMonthlyDocRef, newMonthlyDisplayData);

    t.update(momentDocRef, { needs: momentNeedsData });
    t.update(userDocRef, { hasNeeds: true });
    //TODO:2 for more safety of the data we could check if the moment needs were already set in the last minute and if so cancel the whole batch, so as not to corrupt aggregates by having a nMoments no longer matching the number of moments in the collection
  });

  console.log(
    "Transaction success for ",
    req.body,
    "docs updated: ",
    //keep only the last two part of the path
    aggregateYearlyDocRef.path.split("/").slice(-2).join("/"),
    aggregateMonthlyDocRef.path.split("/").slice(-2).join("/"),
  );
};

module.exports = {
  initAggregateDoc,
  getAggregateDocRefs,
  persistNeedsData,
};

const { Timestamp, FieldValue } = require("firebase-admin/firestore");
const { needsList } = require("./openaiPromptsUtils");
const {
  generateNewRawData,
  generateNewDisplayArray,
} = require("./generateAggregateDataUtils");

const needsInitValues = {
  occurrenceCount: 0,
  importancesSum: 0,
  satisfactionSum: 0,
  importanceValue: 0,
  satisfactionValue: 0,
  importanceDisplayValue: 0,
  satisfactionImpactDisplayValue: 0,
  unsatisfactionImpactDisplayValue: 0,
  satisfactionImpactLabelValue: 0,
  unsatisfactionImpactLabelValue: 0,
};

const needsMap = needsList.reduce((acc, need) => {
  acc[need] = { ...needsInitValues };
  return acc;
}, {});

const initAggregateDoc = async (aggregateDocRef, isRaw = false) => {
  const aggregateDoc = await aggregateDocRef.get();
  if (!aggregateDoc.exists) {
    if (isRaw) {
      await aggregateDocRef.set({
        nMoments: 0,
        totalImportances: 0,
        lastUpdate: FieldValue.serverTimestamp(),
        needs: needsMap, // needs: {need1: { importancesSum: 0, satisfactionSum: 0, occurrenceCount: 0 }, need2: { importancesSum: 0, satisfactionSum: 0, occurrenceCount: 0 }, ...}
        maxImportanceValue: 0,
        totalSatisfactionImpact: 0,
        totalUnsatisfactionImpact: 0,
      });
    } else {
      await aggregateDocRef.set({
        lastUpdate: FieldValue.serverTimestamp(),
      });
    }
  }
};

const getAggregateDocRefs = async (userDocRef, rawMomentDate) => {
  const momentdateObject = JSON.parse(rawMomentDate);
  const momentTs = new Timestamp(
    momentdateObject.seconds,
    momentdateObject.nanoseconds,
  );
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
    initAggregateDoc(aggregateYearlyRawDocRef, true),
    initAggregateDoc(aggregateMonthlyRawDocRef, true),
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

    const newYearlyData = {
      lastUpdate: FieldValue.serverTimestamp(),
      unsatisfaction: generateNewDisplayArray(
        newYearlyRawData,
        "unsatisfaction",
        "unsatisfactionImpactLabelValue",
      ),
      satisfaction: generateNewDisplayArray(
        newYearlyRawData,
        "satisfaction",
        "satisfactionImpactLabelValue",
      ),
      importance: generateNewDisplayArray(
        newYearlyRawData,
        "none",
        "importanceValue",
      ),
    };

    const newMonthlyData = {
      lastUpdate: FieldValue.serverTimestamp(),
      unsatisfaction: generateNewDisplayArray(
        newMonthlyRawData,
        "unsatisfaction",
        "unsatisfactionImpactLabelValue",
      ),
      satisfaction: generateNewDisplayArray(
        newMonthlyRawData,
        "satisfaction",
        "satisfactionImpactLabelValue",
      ),
      importance: generateNewDisplayArray(
        newMonthlyRawData,
        "none",
        "importanceValue",
      ),
    };

    // console.log(
    //   "In transaction before update, newYearlyData",
    //   newYearlyData,
    // );
    //update aggregate docs
    t.update(aggregateYearlyRawDocRef, newYearlyRawData);
    t.update(aggregateMonthlyRawDocRef, newMonthlyRawData);
    t.update(aggregateYearlyDocRef, newYearlyData);
    t.update(aggregateMonthlyDocRef, newMonthlyData);

    t.update(momentDocRef, { needsSatisAndImp: momentNeedsData });
    t.update(userDocRef, { hasNeeds: true });
    //TODO:2 for more safety of the data we could check if the moment needsSatisAndImp were already set in the last minute and if so cancel the whole batch, so as not to corrupt aggregates by having a nMoments no longer matching the number of moments in the collection
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
  persistNeedsData,
};

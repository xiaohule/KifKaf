const { FieldValue } = require("firebase-admin/firestore");

function generateNewRawData(/*mom,*/ doc, momentNeedsData) {
  //variables are prefixed by "moment" when related to the processed moment, "" when related to a need and "total"/"max" when aggregated over all needs
  //1.8
  const momentImportancesSum = Object.values(momentNeedsData).reduce(
    (acc, currentValue) => acc + currentValue.importance,
    0,
  );

  const baseData = {
    nMoments: FieldValue.increment(1),
    totalImportances: doc.data().totalImportances + momentImportancesSum, //2.9+1.8 = 4.7
    lastUpdate: FieldValue.serverTimestamp(),
    totalSatisfactionImpact: 0,
    totalUnsatisfactionImpact: 0,
    maxImportanceValue: 0,
  };
  // console.log("baseData", baseData);

  //1st loop only on mom's needs to update value that relies only on the moment data
  for (let need in doc.data().needs) {
    //if need in momentNeedsData with non-zero importance
    if (momentNeedsData[need] && momentNeedsData[need].importance) {
      const occurrenceCount = doc.data().needs[need].occurrenceCount + 1;

      baseData[`needs.${need}.occurrenceCount`] = occurrenceCount;

      baseData[`needs.${need}.importancesSum`] =
        doc.data().needs[need].importancesSum +
        momentNeedsData[need].importance;

      const satisfactionSum =
        doc.data().needs[need].satisfactionSum +
        momentNeedsData[need].satisfaction;

      baseData[`needs.${need}.satisfactionSum`] = satisfactionSum;

      baseData[`needs.${need}.satisfactionValue`] =
        satisfactionSum / occurrenceCount;

      const dissatisfactionSum =
        doc.data().needs[need].dissatisfactionSum +
        momentNeedsData[need].dissatisfaction;

      baseData[`needs.${need}.dissatisfactionSum`] = dissatisfactionSum;

      baseData[`needs.${need}.dissatisfactionValue`] =
        dissatisfactionSum / occurrenceCount;
    } else {
      //needed in baseData for display data update
      baseData[`needs.${need}.occurrenceCount`] =
        doc.data().needs[need].occurrenceCount;

      baseData[`needs.${need}.satisfactionValue`] =
        doc.data().needs[need].satisfactionValue;

      baseData[`needs.${need}.dissatisfactionValue`] =
        doc.data().needs[need].dissatisfactionValue;

      //not needed: importancesSum & satisfactionSum & dissatisfactionSum
    }
  }

  // 2nd loop on all needs to compute maxImportanceValue, totalSatisfactionImpact and totalUnsatisfactionImpact
  for (let need in doc.data().needs) {
    // console.log(
    //   " In generateNewRawData 2nd loop for need:",
    //   need,
    //   "baseData[`needs.${need}.importancesSum`]",
    //   baseData[`needs.${need}.importancesSum`],
    // );
    const importanceValue =
      (baseData[`needs.${need}.importancesSum`] ??
        doc.data().needs[need].importancesSum) / baseData.totalImportances;

    baseData[`needs.${need}.importanceValue`] = importanceValue;

    if (importanceValue > baseData.maxImportanceValue) {
      baseData.maxImportanceValue = importanceValue;
    }

    const satisfactionValue =
      baseData[`needs.${need}.satisfactionValue`] ??
      doc.data().needs[need].satisfactionValue;

    baseData.totalSatisfactionImpact += importanceValue * satisfactionValue;

    const dissatisfactionValue =
      baseData[`needs.${need}.dissatisfactionValue`] ??
      doc.data().needs[need].dissatisfactionValue;

    baseData.totalUnsatisfactionImpact +=
      importanceValue * dissatisfactionValue;
  }

  //3rd loop on all needs now that we know maxImportanceValue, totalSatisfactionImpact and totalUnsatisfactionImpact
  for (let need in doc.data().needs) {
    //TODO:3 not used anymore now that donut chart
    const importanceDisplayValue =
      baseData[`needs.${need}.importanceValue`] / baseData.maxImportanceValue;
    baseData[`needs.${need}.importanceDisplayValue`] = importanceDisplayValue;

    const satisfactionValue =
      baseData[`needs.${need}.satisfactionValue`] ??
      doc.data().needs[need].satisfactionValue;

    //TODO:3 not used anymore now that donut chart
    baseData[`needs.${need}.satisfactionImpactDisplayValue`] =
      importanceDisplayValue * satisfactionValue;

    baseData[`needs.${need}.satisfactionImpactLabelValue`] =
      (baseData[`needs.${need}.importanceValue`] * satisfactionValue) /
      baseData.totalSatisfactionImpact;

    const dissatisfactionValue =
      baseData[`needs.${need}.dissatisfactionValue`] ??
      doc.data().needs[need].dissatisfactionValue;

    //TODO:3 not used anymore now that donut chart
    baseData[`needs.${need}.unsatisfactionImpactDisplayValue`] =
      importanceDisplayValue * dissatisfactionValue;

    baseData[`needs.${need}.unsatisfactionImpactLabelValue`] =
      (baseData[`needs.${need}.importanceValue`] * dissatisfactionValue) /
      baseData.totalUnsatisfactionImpact;
  }
  // console.log(
  //   "In generateNewRawData, for mom ",
  //   mom,
  //   " for doc: ",
  //   doc.id,
  //   "for momentNeedsData: ",
  //   momentNeedsData,
  //   " returning baseData:",
  //   baseData,
  // );

  return baseData;
}
//   {
//     2023: {
//       nMoments: FieldValue.increment(1),
//       totalImportances: FieldValue.increment(momentImportancesTotal),
//       lastUpdate: FieldValue.serverTimestamp(),
//       needs: {
//         needName: {,
//             occurrenceCount: FieldValue.increment(1);

//             satisfactionSum: FieldValue.increment(momentNeedsData[need].satisfaction),
//             dissatisfactionSum: FieldValue.increment(momentNeedsData[need].dissatisfaction),
//             importancesSum: FieldValue.increment(momentNeedsData[need].importance),

//             importanceValue: importancesSum / totalImportances,
//             satisfactionValue: satisfactionSum / occurrenceCount,
//             dissatisfactionValue: dissatisfactionSum / occurrenceCount,
//             importanceDisplayValue: importanceDisplayValue,
//             satisfactionImpactDisplayValue: satisfactionImpactDisplayValue,
//             unsatisfactionImpactDisplayValue: unsatisfactionImpactDisplayValue,
//             satisfactionImpactLabelValue:satisfactionImpactDisplayValue/totalSatisfactionImpact,
//             unsatisfactionImpactLabelValue:unsatisfactionImpactDisplayValue/totalUnsatisfactionImpact,
//         }
//       },
//     maxImportanceValue: 0,
//     totalSatisfactionImpact: 0,
//     totalUnsatisfactionImpact: 0,
//   };
// }

const keysNeededinFrontend = [
  "occurrenceCount",
  "satisfactionImpactLabelValue",
  "unsatisfactionImpactLabelValue",
  "importanceValue",
];

function allKeysZeroForNeed(newRawData, need) {
  return keysNeededinFrontend.every((item) => {
    let key = `needs.${need}.${item}`;
    return newRawData[key] === 0 || newRawData[key] === undefined;
  });
}

//This generate the data that will be read by the user's frontend
function generateNewDisplayData(newRawData) {
  try {
    if (!newRawData)
      throw new Error("In generateNewDisplayData newRawData is empty");

    let needsDataArray = [];
    const auxObject = {}; // to track existing needs

    Object.keys(newRawData).forEach((item) => {
      if (item.startsWith("needs.")) {
        let [_, need, property] = item.split(".");

        if (
          !allKeysZeroForNeed(newRawData, need) &&
          keysNeededinFrontend.includes(property)
        ) {
          if (!auxObject[need]) {
            auxObject[need] = { needName: need };
            needsDataArray.push(auxObject[need]);
          }

          auxObject[need][property] = newRawData[item];
        }
      }
    });
    //  console.log( "In generateNewDisplayData with filterBy:" filterBy,  "sortBy:",   sortBy,    "returning needsDataArray after arrayization:", needsDataArray, )

    if (needsDataArray.length == 0)
      throw new Error("In generateNewDisplayData needsDataArray is empty");

    const needsDisplayData = {
      lastUpdate: FieldValue.serverTimestamp(),
      satisfaction: needsDataArray
        .filter(
          (needData) =>
            needData.satisfactionImpactLabelValue > 0 &&
            needData.occurrenceCount > 0,
        )
        .sort(
          (a, b) =>
            b.satisfactionImpactLabelValue - a.satisfactionImpactLabelValue,
        ),
      unsatisfaction: needsDataArray
        .filter(
          (needData) =>
            needData.unsatisfactionImpactLabelValue > 0 &&
            needData.occurrenceCount > 0,
        )
        .sort(
          (a, b) =>
            b.unsatisfactionImpactLabelValue - a.unsatisfactionImpactLabelValue,
        ),
      importance: needsDataArray
        .filter(
          (needData) =>
            needData.importanceValue > 0 && needData.occurrenceCount > 0,
        )
        .sort((a, b) => b.importanceValue - a.importanceValue),
    };

    return needsDisplayData;
  } catch (error) {
    console.error("Error in generateNewDisplayData:", error);
    return [];
  }
}

module.exports = {
  generateNewRawData,
  generateNewDisplayData,
};

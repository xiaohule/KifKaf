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

  // 2nd loop on all needs to compute totalSatisfactionImpact and totalUnsatisfactionImpact
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

  //3rd loop on all needs now that we know totalSatisfactionImpact and totalUnsatisfactionImpact
  for (let need in doc.data().needs) {
    const satisfactionValue =
      baseData[`needs.${need}.satisfactionValue`] ??
      doc.data().needs[need].satisfactionValue;

    baseData[`needs.${need}.satisfactionImpactLabelValue`] =
      baseData.totalSatisfactionImpact
        ? (baseData[`needs.${need}.importanceValue`] * satisfactionValue) /
          baseData.totalSatisfactionImpact
        : 0;

    const dissatisfactionValue =
      baseData[`needs.${need}.dissatisfactionValue`] ??
      doc.data().needs[need].dissatisfactionValue;

    baseData[`needs.${need}.unsatisfactionImpactLabelValue`] =
      baseData.totalUnsatisfactionImpact
        ? (baseData[`needs.${need}.importanceValue`] * dissatisfactionValue) /
          baseData.totalUnsatisfactionImpact
        : 0;
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
//     2023-xx-raw: {
//       lastUpdate: FieldValue.serverTimestamp(),
//       nMoments: FieldValue.increment(1),

//       needs: {
//         needName: {,
//             occurrenceCount: FieldValue.increment(1);

//             satisfactionSum: FieldValue.increment(momentNeedsData[need].satisfaction),
//             dissatisfactionSum: FieldValue.increment(momentNeedsData[need].dissatisfaction),
//             importancesSum: FieldValue.increment(momentNeedsData[need].importance),

//             satisfactionValue: satisfactionSum / occurrenceCount,
//             dissatisfactionValue: dissatisfactionSum / occurrenceCount,

//             importanceValue: importancesSum / totalImportances,

//             satisfactionImpactLabelValue:importanceValue*satisfactionValue/totalSatisfactionImpact,
//             unsatisfactionImpactLabelValue:importanceValue*dissatisfactionValue/totalUnsatisfactionImpact,
//         }
//       },

//       totalImportances: FieldValue.increment(momentImportancesTotal),
//       totalSatisfactionImpact: 0,
//       totalUnsatisfactionImpact: 0,
//   };
// }

function generateNewRawDataAfterMomDelete(/*mom,*/ doc, momentNeedsData) {
  //variables are prefixed by "moment" when related to the processed moment, "" when related to a need and "total"/"max" when aggregated over all needs
  //1.8
  const momentImportancesSum = Object.values(momentNeedsData).reduce(
    (acc, currentValue) => acc + currentValue.importance,
    0,
  );

  const baseData = {
    nMoments: FieldValue.increment(-1),
    totalImportances: doc.data().totalImportances - momentImportancesSum,
    lastUpdate: FieldValue.serverTimestamp(),
    totalSatisfactionImpact: 0,
    totalUnsatisfactionImpact: 0,
  };
  console.log("generateNewRawDataAfterMomDelete > baseData", baseData);

  //1st loop only on mom's needs to update value that relies only on the moment data
  for (let need in doc.data().needs) {
    //if need in momentNeedsData with non-zero importance
    if (momentNeedsData[need] && momentNeedsData[need].importance) {
      const occurrenceCount = doc.data().needs[need].occurrenceCount - 1;

      baseData[`needs.${need}.occurrenceCount`] = occurrenceCount;

      baseData[`needs.${need}.importancesSum`] =
        doc.data().needs[need].importancesSum -
        momentNeedsData[need].importance;

      const satisfactionSum =
        doc.data().needs[need].satisfactionSum -
        momentNeedsData[need].satisfaction;

      baseData[`needs.${need}.satisfactionSum`] = satisfactionSum;

      baseData[`needs.${need}.satisfactionValue`] = occurrenceCount
        ? satisfactionSum / occurrenceCount
        : 0;

      const dissatisfactionSum =
        doc.data().needs[need].dissatisfactionSum -
        momentNeedsData[need].dissatisfaction;

      baseData[`needs.${need}.dissatisfactionSum`] = dissatisfactionSum;

      baseData[`needs.${need}.dissatisfactionValue`] = occurrenceCount
        ? dissatisfactionSum / occurrenceCount
        : 0;
    } else {
      //needed in baseData for display data update
      baseData[`needs.${need}.occurrenceCount`] =
        doc.data().needs[need].occurrenceCount;

      baseData[`needs.${need}.satisfactionValue`] =
        doc.data().needs[need].satisfactionValue;

      baseData[`needs.${need}.dissatisfactionValue`] =
        doc.data().needs[need].dissatisfactionValue;
    }
  }

  // 2nd loop on all needs to rebuild totalSatisfactionImpact and totalUnsatisfactionImpact
  for (let need in doc.data().needs) {
    // console.log(
    //   " In generateNewRawData 2nd loop for need:",
    //   need,
    //   "baseData[`needs.${need}.importancesSum`]",
    //   baseData[`needs.${need}.importancesSum`],
    // );
    const importanceValue = baseData.totalImportances
      ? (baseData[`needs.${need}.importancesSum`] ??
          doc.data().needs[need].importancesSum) / baseData.totalImportances
      : 0;

    baseData[`needs.${need}.importanceValue`] = importanceValue;

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

  //3rd loop on all needs now that we know totalSatisfactionImpact and totalUnsatisfactionImpact
  for (let need in doc.data().needs) {
    const satisfactionValue =
      baseData[`needs.${need}.satisfactionValue`] ??
      doc.data().needs[need].satisfactionValue;

    baseData[`needs.${need}.satisfactionImpactLabelValue`] =
      baseData.totalSatisfactionImpact
        ? (baseData[`needs.${need}.importanceValue`] * satisfactionValue) /
          baseData.totalSatisfactionImpact
        : 0;

    const dissatisfactionValue =
      baseData[`needs.${need}.dissatisfactionValue`] ??
      doc.data().needs[need].dissatisfactionValue;

    baseData[`needs.${need}.unsatisfactionImpactLabelValue`] =
      baseData.totalUnsatisfactionImpact
        ? (baseData[`needs.${need}.importanceValue`] * dissatisfactionValue) /
          baseData.totalUnsatisfactionImpact
        : 0;
  }
  console.log(
    "In generateNewRawDataAfterMomDelete, for doc: ",
    doc.id,
    "for momentNeedsData: ",
    momentNeedsData,
    " returning baseData:",
    baseData,
  );

  return baseData;
}

const keysNeededinFrontend = [
  "occurrenceCount",
  "satisfactionImpactLabelValue",
  "unsatisfactionImpactLabelValue",
  "importanceValue",
];

//This generate the data that will be read by the user's frontend
function generateNewDisplayData(newRawData) {
  try {
    console.log("In generateNewDisplayData with newRawData:", newRawData);
    if (!newRawData)
      throw new Error("In generateNewDisplayData newRawData is empty");

    let needsDataArray = [];
    const auxObject = {}; // to track existing needs

    Object.keys(newRawData).forEach((item) => {
      if (item.startsWith("needs.")) {
        let [_, need, property] = item.split(".");

        if (keysNeededinFrontend.includes(property)) {
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
  generateNewRawDataAfterMomDelete,
  generateNewDisplayData,
};

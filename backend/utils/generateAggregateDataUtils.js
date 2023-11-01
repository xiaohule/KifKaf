const { FieldValue } = require("firebase-admin/firestore");

function generateNewRawData(/*mom,*/ doc, momentNeedsData) {
  //variables are prefixed by "moment" when related to the processed moment, "" when related to a need and "total"/"max" when aggregated over all needs
  const momentImportancesSum = Object.values(momentNeedsData).reduce(
    (acc, currentValue) => acc + currentValue[1],
    0,
  );

  const baseData = {
    nMoments: FieldValue.increment(1),
    totalImportances: doc.data().totalImportances + momentImportancesSum,
    lastUpdate: FieldValue.serverTimestamp(),
    totalSatisfactionImpact: 0,
    totalUnsatisfactionImpact: 0,
    maxImportanceValue: 0,
  };
  // console.log("baseData", baseData);

  //1st loop only on mom's needs to update value that relies only on the moment data
  for (let need in doc.data().needs) {
    //if need in momentNeedsData with non-zero importance
    if (momentNeedsData[need] && momentNeedsData[need][1]) {
      const occurrenceCount = doc.data().needs[need].occurrenceCount + 1;
      baseData[`needs.${need}.occurrenceCount`] = occurrenceCount;

      baseData[`needs.${need}.importancesSum`] =
        doc.data().needs[need].importancesSum + momentNeedsData[need][1];

      const satisfactionSum =
        doc.data().needs[need].satisfactionSum + momentNeedsData[need][0];
      baseData[`needs.${need}.satisfactionSum`] = satisfactionSum;

      baseData[`needs.${need}.satisfactionValue`] =
        satisfactionSum / occurrenceCount;
    } else {
      //needed in baseData for display data update
      baseData[`needs.${need}.occurrenceCount`] =
        doc.data().needs[need].occurrenceCount;
      baseData[`needs.${need}.satisfactionValue`] =
        doc.data().needs[need].satisfactionValue;
      //not needed: importancesSum & satisfactionSum
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
    baseData.totalUnsatisfactionImpact +=
      importanceValue * (1 - satisfactionValue);
  }

  //3rd loop on all needs now that we know maxImportanceValue, totalSatisfactionImpact and totalUnsatisfactionImpact
  for (let need in doc.data().needs) {
    const importanceDisplayValue =
      baseData[`needs.${need}.importanceValue`] / baseData.maxImportanceValue;
    baseData[`needs.${need}.importanceDisplayValue`] = importanceDisplayValue;

    const satisfactionValue =
      baseData[`needs.${need}.satisfactionValue`] ??
      doc.data().needs[need].satisfactionValue;
    baseData[`needs.${need}.satisfactionImpactDisplayValue`] =
      importanceDisplayValue * satisfactionValue;
    baseData[`needs.${need}.unsatisfactionImpactDisplayValue`] =
      importanceDisplayValue * (1 - satisfactionValue);

    baseData[`needs.${need}.satisfactionImpactLabelValue`] =
      (baseData[`needs.${need}.importanceValue`] * satisfactionValue) /
      baseData.totalSatisfactionImpact;
    baseData[`needs.${need}.unsatisfactionImpactLabelValue`] =
      (baseData[`needs.${need}.importanceValue`] * (1 - satisfactionValue)) /
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

//             importancesSum: FieldValue.increment(momentNeedsData[need][1]),
//             satisfactionSum: FieldValue.increment(momentNeedsData[need][0]),

//             importanceValue: importancesSum / totalImportances,
//             satisfactionValue: satisfactionSum / occurrenceCount,
//             importanceDisplayValue: importanceDisplayValue,
//             satisfactionImpactDisplayValue: satisfactionImpactDisplayValue,
//             unsatisfactionImpactDisplayValue: unsatisfactionImpactDisplayValue,
//             satisfactionImpactLabelValue:satisfactionImpactDisplayValue/totalSatisfactionImpact,
//             unsatisfactionImpactLabelValue:unsatisfactionImpactDisplayValue,
//         }
//       },
//     maxImportanceValue: 0,
//     totalSatisfactionImpact: 0,
//     totalUnsatisfactionImpact: 0,
//   };
// }

const propertiesOfInterest = [
  "occurrenceCount",
  "satisfactionImpactLabelValue",
  "unsatisfactionImpactLabelValue",
  "importanceDisplayValue",
  "satisfactionImpactDisplayValue",
  "unsatisfactionImpactDisplayValue",
  "importanceValue",
  "satisfactionValue",
];

function allPropertiesZeroForNeed(newRawData, need) {
  return propertiesOfInterest.every((prop) => {
    let key = `needs.${need}.${prop}`;
    return newRawData[key] === 0 || newRawData[key] === undefined;
  });
}

function generateNewDisplayArray( //TODO:3 we could remove all data that won't be used in the frontend to reduce the size of the response
  newRawData,
  filterBy = "none",
  sortBy = "none",
) {
  try {
    // if (filterBy === "satisfaction") {
    //   console.log(
    //     "In generateNewDisplayData with filterBy:",
    //     filterBy,
    //     "sortBy:",
    //     sortBy,
    //     "newRawData:",
    //     newRawData,
    //   );
    // }
    if (!newRawData)
      throw new Error("In generateNewDisplayArray newRawData is empty");

    let needsDataArray = [];
    let auxObject = {}; // to track existing needs

    Object.keys(newRawData).forEach((key) => {
      if (key.startsWith("needs.")) {
        let [_, need, property] = key.split(".");

        if (
          !allPropertiesZeroForNeed(newRawData, need) &&
          propertiesOfInterest.includes(property)
        ) {
          if (!auxObject[need]) {
            auxObject[need] = { needName: need };
            needsDataArray.push(auxObject[need]);
          }

          auxObject[need][property] = newRawData[key];
        }
      }
    });
    // if (filterBy === "satisfaction") {
    //   console.log(
    //     "In generateNewDisplayArray with filterBy:",
    //     filterBy,
    //     "sortBy:",
    //     sortBy,
    //     "returning needsDataArray after arrayization:",
    //     needsDataArray,
    //   );
    // }

    if (needsDataArray.length == 0)
      throw new Error("In generateNewDisplayArray needsDataArray is empty");

    //Filtering
    needsDataArray = needsDataArray.filter((obj) => {
      let needData = obj;

      if (filterBy === "unsatisfaction")
        return needData.satisfactionValue < 1 && needData.occurrenceCount > 0;
      if (filterBy === "satisfaction")
        return needData.satisfactionValue > 0 && needData.occurrenceCount > 0;

      return needData.occurrenceCount > 0;
    });

    //Sorting
    if (sortBy !== "none") {
      needsDataArray.sort((a, b) => b[sortBy] - a[sortBy]);
    }
    // if (filterBy === "satisfaction") {
    //   console.log(
    //     "In generateNewDisplayArray with filterBy:",
    //     filterBy,
    //     "sortBy:",
    //     sortBy,
    //     "returning needsDataArray after filter sorting:",
    //     needsDataArray,
    //   );
    // }

    return needsDataArray;
  } catch (error) {
    console.error("Error in generateNewDisplayArray:", error);
    return [];
  }
}

module.exports = {
  generateNewRawData,
  generateNewDisplayArray,
};

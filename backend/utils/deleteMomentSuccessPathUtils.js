const {
  generateNewRawDataAfterMomDelete,
  generateNewDisplayData,
} = require("./generateAggregateDataUtils");
const {
  getAggregateDocRefs,
} = require("../utils/persistNeedsDataSuccessPathUtils");

const updateAggDataAfterMomDelete = async (db, req, userDocRef) => {
  //get yearly and monthly aggregate docs
  console.log(
    "updateAggDataAfterMomDelete > req.body.momentArchive.date:",
    req.body.momentArchive.date,
  );
  const {
    aggregateYearlyRawDocRef,
    aggregateMonthlyRawDocRef,
    aggregateYearlyDocRef,
    aggregateMonthlyDocRef,
  } = await getAggregateDocRefs(userDocRef, req.body.momentArchive.date);

  const momentNeedsData = req.body.momentArchive.needs;
  console.log(
    "in updateAggDataAfterMomDelete > momentNeedsData:",
    momentNeedsData,
  );

  //persist llm data in firestore
  await db.runTransaction(async (t) => {
    const aggregateYearlyRawDoc = await t.get(aggregateYearlyRawDocRef);
    const aggregateMonthlyRawDoc = await t.get(aggregateMonthlyRawDocRef);

    //TODO:5 simplify all this by separating between summing and averaging, and by using the same unique doc for raw and display data
    const newYearlyRawData = generateNewRawDataAfterMomDelete(
      aggregateYearlyRawDoc,
      momentNeedsData,
    );
    const newMonthlyRawData = generateNewRawDataAfterMomDelete(
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
  });

  console.log(
    "updateAggDataAfterMomDelete > Transaction success for ",
    req.body,
    "docs updated: ",
    //keep only the last two part of the path
    aggregateYearlyDocRef.path.split("/").slice(-2).join("/"),
    aggregateMonthlyDocRef.path.split("/").slice(-2).join("/"),
  );
};

module.exports = {
  updateAggDataAfterMomDelete,
};

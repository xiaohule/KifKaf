const {
  generateNewRawDataAfterMomDelete,
  generateNewDisplayData,
} = require("./generateAggregateDataUtils");
const {
  getAggregateDocRefs,
} = require("../utils/persistNeedsDataSuccessPathUtils");

const updateAggDataAfterMomDelete = async (db, req, userDocRef) => {
  //get moment doc ref
  const momentDocRef = userDocRef.collection("moments").doc(req.body.momentId);

  //persist llm data in firestore
  await db.runTransaction(async (t) => {
    const momentDoc = await t.get(momentDocRef);

    //if either the moment doc doesn't exist or the moment needs already contains some values, abort the transaction
    if (momentDoc.exists) {
      if (
        Object.keys(momentDoc.data().needs).length > 0 &&
        !momentDoc.data().needs.Oops &&
        !momentDoc.data().needs.error
      ) {
        //get yearly and monthly aggregate docs
        const {
          aggregateYearlyRawDocRef,
          aggregateMonthlyRawDocRef,
          aggregateYearlyDocRef,
          aggregateMonthlyDocRef,
        } = await getAggregateDocRefs(userDocRef, momentDoc.data().date);

        const aggregateYearlyRawDoc = await t.get(aggregateYearlyRawDocRef);
        const aggregateMonthlyRawDoc = await t.get(aggregateMonthlyRawDocRef);

        //TODO:5 simplify all this by separating between summing and averaging, and by using the same unique doc for raw and display data
        const newYearlyRawData = generateNewRawDataAfterMomDelete(
          aggregateYearlyRawDoc,
          momentDoc.data().needs,
        );
        const newMonthlyRawData = generateNewRawDataAfterMomDelete(
          aggregateMonthlyRawDoc,
          momentDoc.data().needs,
        );

        const newYearlyDisplayData = generateNewDisplayData(newYearlyRawData);
        const newMonthlyDisplayData = generateNewDisplayData(newMonthlyRawData);

        // console.log("In transaction before update, newYearlyDisplayData", newYearlyDisplayData);
        //update aggregate docs
        await t.update(aggregateYearlyRawDocRef, newYearlyRawData);
        await t.update(aggregateMonthlyRawDocRef, newMonthlyRawData);
        await t.update(aggregateYearlyDocRef, newYearlyDisplayData);
        await t.update(aggregateMonthlyDocRef, newMonthlyDisplayData);
      }
      await t.delete(momentDocRef);
    } else {
      throw new Error(
        "In updateAggDataAfterMomDelete > aborting transaction bec. momentDoc doesn't exist " +
          JSON.stringify(req.body),
      );
    }
  });

  console.log(
    "updateAggDataAfterMomDelete > Transaction success for ",
    req.body,
  );
};

module.exports = {
  updateAggDataAfterMomDelete,
};

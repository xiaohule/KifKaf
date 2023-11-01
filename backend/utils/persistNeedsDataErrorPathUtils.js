const { FieldValue } = require("firebase-admin/firestore");
const crypto = require("crypto");
const { needsList } = require("./openaiPromptsUtils");

function generateFirestoreDocId(text) {
  // Step 1: Hash the text using SHA-256
  const hash = crypto.createHash("sha256").update(text, "utf8").digest();

  // Step 2: Convert the hash to Base64URL format
  let base64url = hash
    .toString("base64")
    .replace(/\+/g, "-") // replace all '+' with '-'
    .replace(/\//g, "_") // replace all '/' with '_'
    .replace(/=+$/, ""); // remove any trailing '=' characters
  // Guard against the pattern __.*__
  if (/^__.*__$/.test(base64url)) {
    base64url = "ID-" + base64url;
  }

  // Step 3: Ensure it's less than 1,500 bytes (this step might be redundant given the fixed size of SHA-256 hashes, but included for completeness)
  if (Buffer.from(base64url).length > 1500) {
    base64url = base64url.substring(0, 1500);
  }

  console.log("In generateFirestoreDocId", text, base64url);
  return base64url;
}

async function persistInvalidMomentNeedsData(
  db,
  req,
  momentDocRef,
  momentNeedsData,
) {
  const invalidMomentDocId = generateFirestoreDocId(req.query.momentText);
  const invalidMomentsDocRef = db
    .collection("invalidMoments")
    .doc(invalidMomentDocId);
  const batch = db.batch();
  batch.set(invalidMomentsDocRef, {
    moment: req.query.momentText,
    reason: momentNeedsData,
    user: req.uid,
    lastUpdate: FieldValue.serverTimestamp(),
  });
  batch.update(momentDocRef, { needsSatisAndImp: momentNeedsData });
  await batch.commit();
}

async function persistUnexpectedNeedsIfAny(db, req, momentNeedsData) {
  for (let need in momentNeedsData) {
    //if need is not in needsList, add it to offlistNeeds collection
    if (!needsList.includes(need)) {
      delete momentNeedsData[need];
      console.log(need, " is not found in the needsList.");
      const offlisNeedsRef = db
        .collection("offlistNeeds")
        .doc(need)
        .collection("moments")
        .doc(req.query.momentId);
      //TODO:2 make it append and not overwrite
      await offlisNeedsRef.set({
        moment: req.query.momentText,
        needsSatisAndImp: momentNeedsData,
        user: req.uid,
        lastUpdate: FieldValue.serverTimestamp(),
      });
    }
  }
}

module.exports = {
  persistInvalidMomentNeedsData,
  persistUnexpectedNeedsIfAny,
};

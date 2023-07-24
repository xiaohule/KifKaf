const nodemailer = require("nodemailer");
const Imap = require("imap");
const simpleParser = require("mailparser").simpleParser;
const makeEmailAccount = async () => {
  const testAccount = await nodemailer.createTestAccount();
  // use testAccount.user and testAccount.pass
  // to log in into the email inbox
  const imapConfig = {
    user: testAccount.user,
    password: testAccount.pass,
    host: "imap.ethereal.email",
    port: 993,
    tls: true,
    authTimeout: 10000,
  };
  const userEmail = {
    email: testAccount.user,
    async getLastEmail() {
      return new Promise((resolve, reject) => {
        try {
          const imap = new Imap(imapConfig);
          imap.once("ready", () => {
            imap.openBox("INBOX", false, () => {
              imap.search(["UNSEEN", ["SINCE", new Date()]], (err, results) => {
                const f = imap.fetch(results, { bodies: "" });
                f.on("message", (msg) => {
                  msg.on("body", (stream) => {
                    simpleParser(stream, async (err, parsed) => {
                      // const {from, subject, textAsHtml, text} = parsed;
                      resolve(parsed);
                    });
                  });
                  msg.once("attributes", (attrs) => {
                    const { uid } = attrs;
                    imap.addFlags(uid, ["\\Seen"], () => {
                      console.log("Marked as read!");
                    });
                  });
                });
                f.once("error", (error) => {
                  console.error(error);
                  return resolve(null);
                });
                f.once("end", () => {
                  console.log("Done fetching all messages!");
                  imap.end();
                });
              });
            });
          });
          imap.once("error", (err) => {
            console.error(err);
            return resolve(null);
          });
          imap.once("end", () => console.log("Connection ended"));
          imap.connect();
        } catch (ex) {
          console.log("an error occurred");
        }
      });
    },
  };
  return userEmail;
};
module.exports = makeEmailAccount;
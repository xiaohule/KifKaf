// standalone pwa in http
// works:
// in DESKTOP for chrome, safari, chrome standalone pwa
// in MOBILE for chrome, safari, safari minimal-ui pwa
// doesn't work
//In DESKTOP for safari pwa since can't install a safari pwa in desktop yet
//  in MOBILE for ios safari standalone pwa, android chrome standalone pwa yet, android chrome (as explained also in https://bugs.webkit.org/show_bug.cgi?id=225298 graceful fallback needed)
//persisting microphone permission (Allow “app_name” to use your microphone?)
// doesn't work:
// in DESKTOP for safari (neither tab closing nor browser closing) and edge (pb different ils considère que la perm est ok mais mon code cache le mic button), safari pwa since can't install a safari pwa in desktop yet
//works:
//  in chrome, chrome standalone pwa,

//mic buttons visible
//wworks in whatpwacandotoday in mobile chrome safari standalone pwa but not in my app
import { ref } from "vue";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import { useMomentsStore } from "./../stores/moments.js";
const ms = useMomentsStore();

export const showSpeechRecognitionButton = ref(false);
export const isRecognizing = ref(false);
export let webRecognitionInstance = null;

export const useSpeechRecognition = async (
  newMomText,
  errorDialogOpened,
  errorDialogText,
) => {
  let toggleSpeechRecognition;
  let stopSpeechRecognition;

  if (process.env.MODE !== "capacitor") {
    //TODO:2 test if Speech Recognition requires an Internet connection, so will not function when your PWA users are offline -> have graceful fail
    console.log("In useSpeechRecognition, speech recognition for web");

    const recognitionInstanceNaming =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition;

    if (recognitionInstanceNaming) {
      showSpeechRecognitionButton.value = true;
      webRecognitionInstance = new recognitionInstanceNaming();
      webRecognitionInstance.continuous = true;
      webRecognitionInstance.interimResults = true;
      webRecognitionInstance.onerror = function (event) {
        showSpeechRecognitionButton.value = false;
        isRecognizing.value = false;
        console.error("Disabling Speech Recognition because of :", event);
      };
    }

    toggleSpeechRecognition = async () => {
      if (
        showSpeechRecognitionButton.value === false ||
        !webRecognitionInstance
      ) {
        return; // return early if the API is not available
      }

      //TODO:2 here in the case of no user setting we're implicitly hoping that device language will be supported by the speech reco API
      if (!isRecognizing.value) {
        webRecognitionInstance.lang =
          ms.userDoc?.speechRecoLanguage ||
          ms.userDoc?.deviceLanguage ||
          "en-US";
        webRecognitionInstance.onresult = (event) => {
          try {
            let finalTranscript = "";
            let interimTranscript = "";

            for (let i = 0; i < event.results.length; i++) {
              const result = event.results[i];

              if (result.isFinal) {
                finalTranscript += result[0].transcript;
              } else {
                interimTranscript += result[0].transcript;
              }
            }

            newMomText.value = finalTranscript + interimTranscript;
          } catch (error) {
            // Handle the error, e.g., log or display an error message
            console.error("Error in speech recognition:", error);
          }
        };

        webRecognitionInstance.start(); // Start listening
        isRecognizing.value = true;
      } else {
        await stopSpeechRecognition();
      }
    };

    stopSpeechRecognition = async () => {
      if (
        showSpeechRecognitionButton.value === false ||
        !webRecognitionInstance
      ) {
        return; // return early if the API is not available
      } else if (isRecognizing.value) {
        webRecognitionInstance.stop(); // Stop listening
        isRecognizing.value = false;
      }
    };
  } else {
    try {
      console.log("In useSpeechRecognition, speech recognition for Capacitor");
      const isAvailable = (await SpeechRecognition.available()).available;
      console.log(
        "In useSpeechRecognition,  SpeechRecognition.available():",
        isAvailable,
      );
      if (isAvailable) showSpeechRecognitionButton.value = true;
      let hasPermissions = (await SpeechRecognition.checkPermissions())
        .speechRecognition;
      console.log(
        "In useSpeechRecognition,  SpeechRecognition.checkPermissions():",
        hasPermissions,
      );

      // const suplang = await SpeechRecognition.getSupportedLanguages();
      // console.log(
      //   "In useSpeechRecognition,  SpeechRecognition.getSupportedLanguages():",
      //   suplang,
      // );

      toggleSpeechRecognition = async () => {
        let previousMatch = "";
        console.log(
          "In useSpeechRecognition, toggleSpeechRecognition for Capacitor called",
        );

        if (hasPermissions === "denied") {
          errorDialogText.value = `
          <strong>KifKaf needs the Speech Recognition permission for this.</strong><br>
          To grant it:<br>
          1. Go to your phone's <strong>Settings</strong>.<br>
          2. Scroll and tap on <strong>KifKaf</strong>.<br>
          3. Allow access to the <strong>Speech Recognition</strong>.<br><br>
          You have full control and can change your choices at any time.
          `;
          errorDialogOpened.value = true;
          return;
        } else if (hasPermissions === "prompt") {
          hasPermissions = (await SpeechRecognition.requestPermissions())
            .speechRecognition;
          if (hasPermissions !== "granted") return;
        }

        if (hasPermissions === "granted") {
          if (!isRecognizing.value) {
            SpeechRecognition.addListener("partialResults", (data) => {
              // newMomText.value = data.matches[0];
              // console.log("In speechReco Capacitor previousMatch:", previousMatch);
              // console.log("In speechReco Capacitor partialResults:", data.matches);
              if (newMomText.value.endsWith(previousMatch)) {
                newMomText.value =
                  newMomText.value.substring(
                    0,
                    newMomText.value.lastIndexOf(previousMatch),
                  ) + data.matches[0];
              }
              previousMatch = data.matches[0];
            });

            SpeechRecognition.start({
              language:
                ms.userDoc?.speechRecoLanguage ||
                ms.userDoc?.deviceLanguage ||
                "en-US",
              maxResults: 1,
              prompt: "Say something",
              partialResults: true,
              popup: true,
            })
              .then(() => {
                isRecognizing.value = true;
              })
              .catch((error) => {
                console.error("Error starting speech recognition:", error);
                isRecognizing.value = false;

                if (error.message === "User denied access to microphone") {
                  errorDialogText.value = `
                <strong>KifKaf needs the Microphone permission for this.</strong><br>
                To grant it:<br>
                1. Go to your phone's <strong>Settings</strong>.<br>
                2. Scroll and tap on <strong>KifKaf</strong>.<br>
                3. Allow access to the <strong>Microphone</strong>.<br><br>
                You have full control and can change your choices at any time.
                `;
                  errorDialogOpened.value = true;
                }
              });
          } else {
            await stopSpeechRecognition();
          }
        }
      };

      stopSpeechRecognition = async () => {
        if (
          showSpeechRecognitionButton.value === false ||
          hasPermissions !== "granted"
        ) {
          return; // return early if the API is not available
        } else if (isRecognizing.value) {
          SpeechRecognition.removeAllListeners();
          SpeechRecognition.stop();
          isRecognizing.value = false;
        }
      };
    } catch (error) {
      showSpeechRecognitionButton.value = false;
      console.log("In useSpeechRecognition, error:", error);
    }
  }

  return {
    toggleSpeechRecognition,
    stopSpeechRecognition,
  };
};

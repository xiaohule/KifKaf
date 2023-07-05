// standalone pwa in http
// works:
// in DESKTOP for chrome, safari, chrome standalone pwa
// in MOBILE for chrome, safari, safari minimal-ui pwa
// doesn't work
//  in MOBILE for ios safari standalone pwa, android chrome standalone pwa yet, android chrome (as explained also in https://bugs.webkit.org/show_bug.cgi?id=225298 graceful fallback needed)
//TODO:1 test if https improve things, test if Speech Recognition requires an Internet connection, so will not function when your PWA users are offline
// TODO:2 persevere the fact that the user has already granted permission to use the microphone so that we don't ask again when kill/restart the app
// TODO:2 persevere the fact that speech recognition is not available in user's setup so that we don't show the button back when kill/restart the app
import { ref } from "vue";

export const isRecognizing = ref(false);
export let recognition = null;

export const useSpeechRecognition = (rawNewText) => {
  const showSpeechRecognitionButton = ref(false);
  const recognitionInstanceNaming =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition;

  if (recognitionInstanceNaming) {
    showSpeechRecognitionButton.value = true;
    recognition = new recognitionInstanceNaming();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "fr-FR"; //TODO:3 make this dynamic based on user's language
    recognition.onerror = function (event) {
      showSpeechRecognitionButton.value = false;
      isRecognizing.value = false;
      console.error("Disabling Speech Recognition because of :", event);
    };
  }

  const toggleSpeechRecognition = () => {
    if (showSpeechRecognitionButton.value === false || !recognition) {
      return; // return early if the API is not available
    }

    if (!isRecognizing.value) {
      recognition.onresult = (event) => {
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

          rawNewText.value = finalTranscript + interimTranscript;
        } catch (error) {
          // Handle the error, e.g., log or display an error message
          console.error("Error in speech recognition:", error);
        }
      };

      recognition.start(); // Start listening
      isRecognizing.value = true;
    } else {
      recognition.stop(); // Stop listening
      isRecognizing.value = false;
    }
  };

  return {
    showSpeechRecognitionButton,
    toggleSpeechRecognition,
  };
};

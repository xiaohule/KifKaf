// src/composables/verifiedUserRedirectUtils.js
import { watch } from "vue";
import { useRouter } from "vue-router";
import { logEvent } from "src/boot/firebaseBoot";
import { useMomentsStore } from "../stores/moments.js";

const ms = useMomentsStore();

export function useVerifiedUserRedirectUtils(currentUser, redirectPath = "/") {
  const router = useRouter();
  let checkEmailVerifiedInterval = null;

  watch(
    currentUser,
    (newVal) => {
      if (newVal && !newVal.emailVerified) {
        checkEmailVerifiedInterval = setInterval(async () => {
          await newVal.reload();
          if (newVal.emailVerified) {
            clearInterval(checkEmailVerifiedInterval);
            logEvent("login", { method: "email" });
            ms.setUserDocValue({ lastLoginMethod: "email" });
            console.log(
              "User's email is now verified. Redirecting to",
              redirectPath,
            );
            router.push(redirectPath);
          }
        }, 300);
      } else if (newVal && newVal.emailVerified) {
        router.push(redirectPath);
      }
    },
    { immediate: true },
  );

  const stopUserVerificationCheck = () => {
    if (checkEmailVerifiedInterval) {
      clearInterval(checkEmailVerifiedInterval);
    }
  };

  return { stopUserVerificationCheck };
}
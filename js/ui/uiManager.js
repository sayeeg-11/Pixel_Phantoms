import { showLoader, hideLoader } from "./loader.js";
import { showToast } from "./toast.js";

export async function withUIFeedback(asyncTask, messages = {}) {
  try {
    showLoader();
    const result = await asyncTask();
    if (messages.success) {
      showToast(messages.success, "success");
    }
    return result;
  } catch (err) {
    showToast(messages.error || "Something went wrong", "error");
    throw err;
  } finally {
    hideLoader();
  }
}


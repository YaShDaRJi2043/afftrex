document.addEventListener("DOMContentLoaded", () => {
  // Extract the click_id from the query string
  const urlParams = new URLSearchParams(window.location.search);
  const clickId = urlParams.get("click_id");

  if (clickId) {
    // Store the click_id in a cookie
    document.cookie = `click_id=${clickId}; path=/; max-age=${
      24 * 60 * 60
    }; samesite=strict`;

    // Store the click_id in localStorage
    localStorage.setItem("click_id", clickId);

    console.log("Click ID stored:", clickId);
  } else {
    console.warn("No click_id found in the query string.");
  }
});

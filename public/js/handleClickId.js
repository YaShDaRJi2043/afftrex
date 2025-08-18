document.addEventListener("DOMContentLoaded", () => {
  // Extract the click_id from the query string
  const urlParams = new URLSearchParams(window.location.search);
  const clickId = urlParams.get("click_id");

  if (clickId) {
    // Store the click_id in a cookie
    document.cookie = `click_id=${clickId}; path=/; max-age=${24 * 60 * 60}; samesite=strict`;

    // Store the click_id in localStorage
    localStorage.setItem("click_id", clickId);

    console.log("Click ID stored:", clickId);

    // Redirect to the same URL without the click_id query parameter
    urlParams.delete("click_id");
    const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
    setTimeout(() => {
      window.location.href = newUrl;
    }, 2000); // Wait for 2 seconds before redirecting
  } else {
    console.warn("No click_id found in the query string.");
  }
});

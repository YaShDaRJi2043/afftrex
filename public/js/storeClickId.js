document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  // Extract data from the body tag's data-* attributes
  const clickId = body.getAttribute("data-click-id");
  const redirectUrl = body.getAttribute("data-redirect-url");

  // Store the click ID in a cookie
  document.cookie = `click_id=${clickId}; path=/; max-age=${
    24 * 60 * 60
  }; samesite=strict`;

  // Store the click ID in localStorage
  localStorage.setItem("click_id", clickId);

  // Redirect to the target URL
  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 2000); // Wait for 2 seconds before redirecting
});

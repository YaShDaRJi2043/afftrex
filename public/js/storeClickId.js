document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  // Extract data from the body tag's data-* attributes
  const clickId = body.getAttribute("data-click-id");
  let redirectUrl = body.getAttribute("data-redirect-url");

  // Store the click ID in a cookie
  document.cookie = `click_id=${clickId}; path=/; max-age=${
    24 * 60 * 60
  }; samesite=strict`;

  // Store the click ID in localStorage
  localStorage.setItem("click_id", clickId);

  // Append click_id to the redirect URL correctly
  const url = new URL(redirectUrl);
  url.searchParams.set("click_id", clickId);
  redirectUrl = url.toString();

  // Redirect to the target URL
  setTimeout(() => {
    window.location.href = redirectUrl; // Redirect with click_id in the query string
  }, 2000); // Wait for 2 seconds before redirecting
});

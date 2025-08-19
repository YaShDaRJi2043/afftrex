document.addEventListener("DOMContentLoaded", () => {
  // Fetch the click_id from a data-* attribute in the HTML
  const body = document.body;
  const clickId = body.getAttribute("data-click-id");
  const redirectUrl = body.getAttribute("data-redirect-url");

  if (clickId) {
    // Store the click_id in a cookie with SameSite=None and domain .afftrex.org
    document.cookie = `click_id=${clickId}; path=/; max-age=${
      24 * 60 * 60
    }; domain=.afftrex.org; samesite=none; secure`;

    // Store the click_id in localStorage
    localStorage.setItem("click_id", clickId);

    console.log("Click ID stored:", clickId);

    // Redirect to the target URL
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 2000); // Wait for 2 seconds before redirecting
  } else {
    console.warn("No click_id found in the data attribute.");
  }
});

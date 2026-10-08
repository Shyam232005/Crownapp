/**
 * Comprehensive client-side sign out handler:
 * 1. Calls the backend /api/auth/logout route to clear HTTP-only session cookies
 * 2. Clears client-side cookies, localStorage, and sessionStorage
 * 3. Force-redirects to /login to flush in-memory React & Next.js cache
 */
export async function handleUserSignOut() {
  try {
    // 1. Invalidate session cookie on server
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Sign out API call error:", err);
  }

  // 2. Clear client-accessible cookies
  if (typeof document !== "undefined") {
    const cookiesToClear = ["crown_session", "token", "session", "user", "fineOpsUserId"];
    cookiesToClear.forEach((name) => {
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;`;
    });
  }

  // 3. Clear localStorage & sessionStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (storageErr) {
      console.error("Storage clear error:", storageErr);
    }

    // 4. Force full page redirect to /login
    window.location.href = "/login";
  }
}

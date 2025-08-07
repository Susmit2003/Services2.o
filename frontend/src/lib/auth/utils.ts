/**
 * Retrieves the auth token from localStorage and formats it for API request headers.
 * @returns An object with the Authorization header, or null if no token is found.
 */
export function getAuthHeaders(): { Authorization: string } | null {
  // Ensure this code only runs on the client-side
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}
export function useAuth() {
  return localStorage.getItem("token");
}

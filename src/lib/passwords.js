export const MIN_PASSWORD = 8;

export function passwordProblem(password) {
  if (typeof password !== "string" || password.length < MIN_PASSWORD) {
    return `Passwords need at least ${MIN_PASSWORD} characters.`;
  }
  if (password.length > 72) return "Passwords can be at most 72 characters.";
  return null;
}

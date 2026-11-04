export const DEMO_ROLE_COOKIE = "lastplate-demo-role";

export type DemoRole = "donor" | "ngo" | "admin";

export function parseDemoRole(value: string | undefined): DemoRole {
  if (value === "ngo") return "ngo";
  if (value === "admin") return "admin";
  return "donor";
}

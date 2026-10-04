export type ContactValues = {
  name: string;
  email: string;
  projectType: string;
  message: string;
};
export type ContactErrors = Partial<Record<keyof ContactValues, string>>;
export const projectTypes = [
  "Visual design",
  "Brand identity",
  "Editorial design",
  "Digital experience",
  "Something else",
] as const;
export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (values.name.trim().length < 2 || values.name.trim().length > 100)
    errors.name = "Enter your name (2–100 characters).";
  if (
    values.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
  )
    errors.email = "Enter a valid email address.";
  if (
    !projectTypes.includes(values.projectType as (typeof projectTypes)[number])
  )
    errors.projectType = "Choose a project type.";
  if (values.message.trim().length < 10 || values.message.trim().length > 5000)
    errors.message = "Write a little about your project (10–5,000 characters).";
  return errors;
}

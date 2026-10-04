import test from "node:test";
import assert from "node:assert/strict";
import { validateContact } from "../lib/contact.ts";
const valid = {
  name: "A real person",
  email: "person@example.com",
  projectType: "Brand identity",
  message: "I would like to discuss a visual identity project.",
};
test("accepts a complete enquiry, including whitespace around email and name", () => {
  assert.deepEqual(
    validateContact({
      ...valid,
      name: "  Ashik  ",
      email: " person@example.com ",
    }),
    {},
  );
});
test("rejects empty and whitespace-only fields", () => {
  assert.equal(
    Object.keys(
      validateContact({
        name: " ",
        email: "",
        projectType: "",
        message: "     ",
      }),
    ).length,
    4,
  );
});
test("rejects malformed addresses, excessive lengths and unrecognized project types", () => {
  assert.ok(validateContact({ ...valid, email: "person@@example.com" }).email);
  assert.ok(validateContact({ ...valid, name: "n".repeat(101) }).name);
  assert.ok(validateContact({ ...valid, message: "m".repeat(5001) }).message);
  assert.ok(
    validateContact({ ...valid, projectType: "Unexpected input" }).projectType,
  );
});
test("accepts boundary-length enquiries and international names", () => {
  assert.deepEqual(
    validateContact({
      ...valid,
      name: "আশিক রাব্বানী",
      message: "m".repeat(5000),
    }),
    {},
  );
  assert.deepEqual(
    validateContact({ ...valid, name: "AB", message: "0123456789" }),
    {},
  );
});

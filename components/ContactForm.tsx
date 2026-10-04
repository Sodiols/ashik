"use client";
import { useEffect, useRef, useState } from "react";
import {
  validateContact,
  type ContactErrors,
  type ContactValues,
} from "@/lib/contact";
import { ProjectTypeSelect } from "./ProjectTypeSelect";
import { ContactSuccess } from "./ContactSuccess";
type SubmissionState = "idle" | "submitting" | "success" | "error";
const empty: ContactValues = {
  name: "",
  email: "",
  projectType: "",
  message: "",
};
export function ContactForm({ onComplete }: { onComplete: (complete: boolean) => void }) {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [failure, setFailure] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const controller = useRef<AbortController | null>(null);
  const busy = useRef(false);
  const mounted = useRef(false);
  const success = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<keyof ContactValues | null>(null);
  const key = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (status !== "success") return;
    const section = success.current?.closest("section");
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top >= innerHeight || rect.bottom <= 0) return;
    const settle = new Event("portfolio:contact-success", { cancelable: true });
    window.dispatchEvent(settle);
    if (settle.defaultPrevented) return;
    success.current?.focus({ preventScroll: true });
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: Math.max(0, rect.top + scrollY), behavior: reduced ? "instant" : "smooth" });
  }, [status]);
  useEffect(() => {
    const field = pendingFocus.current;
    if (!field) return;
    pendingFocus.current = null;
    // Focus after the error description is present and the click has settled.
    form.current?.querySelector<HTMLElement>(`#${field}`)?.focus({ preventScroll: true });
  }, [errors]);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const keepFocusedFieldVisible = () => {
      const field = document.activeElement;
      if (
        !(field instanceof HTMLElement) ||
        !form.current?.contains(field) ||
        !field.matches("input:not([type=hidden]),select,textarea,[role=combobox]")
      ) return;
      const visual = window.visualViewport;
      const visibleTop = visual?.offsetTop ?? 0;
      const visibleBottom = visibleTop + (visual?.height ?? innerHeight);
      const headerBottom =
        document.querySelector(".header")?.getBoundingClientRect().bottom ?? 0;
      const top = Math.max(visibleTop, headerBottom) + 16;
      const bottom = visibleBottom - 16;
      const rect = field.getBoundingClientRect();
      const fieldHeight = Math.min(rect.height, Math.max(0, bottom - top));
      if (rect.top >= top && rect.top + fieldHeight <= bottom) return;
      const centeredOffset = Math.max(0, (bottom - top - fieldHeight) / 2);
      window.scrollTo({
        top: Math.max(0, scrollY + rect.top - top - centeredOffset),
        behavior: "instant",
      });
    };
    const schedule = () => {
      clearTimeout(timer);
      // Wait for keyboard/orientation reflow and the existing motion refresh.
      timer = setTimeout(keepFocusedFieldVisible, 250);
    };
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    document.addEventListener("focusin", schedule);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      document.removeEventListener("focusin", schedule);
    };
  }, []);
  const update = (field: keyof ContactValues, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    if (status === "error") setStatus("idle");
  };
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      pendingFocus.current = Object.keys(nextErrors)[0] as keyof ContactValues;
      return;
    }
    if (!key) {
      setFailure(
        "Messages are temporarily unavailable. Please try again later.",
      );
      setStatus("error");
      return;
    }
    const data = new FormData(event.currentTarget);
    if (data.get("botcheck")) {
      setFailure("The message could not be sent. Please try again.");
      setStatus("error");
      return;
    }
    busy.current = true;
    setStatus("submitting");
    setFailure("");
    controller.current = new AbortController();
    const timeout = setTimeout(() => controller.current?.abort(), 20000);
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: controller.current.signal,
        body: JSON.stringify({
          access_key: key,
          name: values.name.trim(),
          email: values.email.trim(),
          project_type: values.projectType,
          message: values.message.trim(),
          subject: "New project enquiry — Ashik Rabbani",
          from_name: "Ashik Rabbani Portfolio",
          botcheck: false,
        }),
      });
      const result: unknown = await response.json();
      if (
        !response.ok ||
        !result ||
        typeof result !== "object" ||
        !("success" in result) ||
        result.success !== true
      )
        throw new Error("submission-failed");
      if (mounted.current) {
        setStatus("success");
        setValues(empty);
        onComplete(true);
      }
    } catch (error) {
      if (!mounted.current) return;
      if (error instanceof DOMException && error.name === "AbortError")
        setFailure(
          "The request timed out. Check your connection and try again.",
        );
      else
        setFailure("Your message wasn’t sent. Please try again in a moment.");
      setStatus("error");
    } finally {
      clearTimeout(timeout);
      busy.current = false;
      controller.current = null;
    }
  }
  if (status === "success")
    return (
      <ContactSuccess focusRef={success} onReset={() => {
        setStatus("idle");
        onComplete(false);
        requestAnimationFrame(() => form.current?.querySelector<HTMLElement>("#name")?.focus());
      }} />
    );
  return (
    <form
      className="contact-form"
      action="https://api.web3forms.com/submit"
      method="POST"
      ref={form}
      onSubmit={submit}
      noValidate
      aria-busy={status === "submitting"}
    >
      <input type="hidden" name="access_key" value={key ?? ""} />
      <input
        type="hidden"
        name="subject"
        value="New project enquiry — Ashik Rabbani"
      />
      <noscript>
        <p className="form-feedback">
          Enable JavaScript for inline validation and submission updates.
        </p>
      </noscript>
      <div className="form-row grid grid-cols-1 gap-0">
        <div className="form-field min-w-0">
          <label htmlFor="name">YOUR NAME</label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            placeholder="Name"
          />
          {errors.name && (
            <p className="field-error" id="name-error">
              {errors.name}
            </p>
          )}
        </div>
        <div className="form-field min-w-0">
          <label htmlFor="email">EMAIL ADDRESS</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="field-error" id="email-error">
              {errors.email}
            </p>
          )}
        </div>
      </div>
      <div className="form-field">
        <label id="project-type-label" htmlFor="projectType">WHAT ARE YOU THINKING?</label>
        <ProjectTypeSelect
          value={values.projectType}
          onChange={(value) => update("projectType", value)}
          error={errors.projectType}
        />
        {errors.projectType && (
          <p className="field-error" id="type-error">
            {errors.projectType}
          </p>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="message">A LITTLE ABOUT YOUR PROJECT</label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={3}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          placeholder="Tell me what you have in mind…"
        />
        {errors.message && (
          <p className="field-error" id="message-error">
            {errors.message}
          </p>
        )}
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="botcheck">Leave this field empty</label>
        <input
          id="botcheck"
          type="checkbox"
          name="botcheck"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div className="form-submit-row flex items-center justify-between gap-5">
        <span className="form-note">
          A good conversation
          <br />
          is a good place to start.
        </span>
        <button
          className="send-button tap-target"
          type="submit"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "SENDING…" : "SEND MESSAGE"}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
      <div className="form-feedback" role="status" aria-live="polite">
        {status === "error" && <p>{failure}</p>}
      </div>
    </form>
  );
}

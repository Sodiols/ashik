"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { projectTypes } from "@/lib/contact";

type Props = { value: string; onChange: (value: string) => void; error?: string };

export function ProjectTypeSelect({ value, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [placement, setPlacement] = useState({ side: "bottom", height: 248 });
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const search = useRef({ text: "", time: 0 });

  function placeMenu() {
    if (!trigger.current) return;
    const rect = trigger.current.getBoundingClientRect();
    const section = trigger.current.closest("section")?.getBoundingClientRect();
    const visual = window.visualViewport;
    const top = Math.max(
      visual?.offsetTop ?? 0,
      document.querySelector(".header")?.getBoundingClientRect().bottom ?? 0,
      section?.top ?? 0,
    ) + 12;
    const bottom = Math.min(
      (visual?.offsetTop ?? 0) + (visual?.height ?? innerHeight),
      section?.bottom ?? Infinity,
    ) - 12;
    const below = bottom - rect.bottom - 8;
    const above = rect.top - top - 8;
    const side = below < 248 && above > below ? "top" : "bottom";
    setPlacement({ side, height: Math.max(44, Math.min(248, side === "top" ? above : below)) });
  }

  function showMenu(index = Math.max(0, projectTypes.findIndex((type) => type === value))) {
    trigger.current?.focus({ preventScroll: true });
    placeMenu();
    search.current = { text: "", time: 0 };
    setActive(index);
    setOpen(true);
  }

  function choose(index: number) {
    onChange(projectTypes[index]);
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }

  function handleKey(event: KeyboardEvent<HTMLButtonElement>) {
    const { key } = event;
    if (key === "Tab") {
      if (open) {
        onChange(projectTypes[active]);
        setOpen(false);
      }
      return;
    }
    if (key === "Escape") {
      if (open) event.preventDefault();
      setOpen(false);
      return;
    }
    if (["Enter", " ", "ArrowDown", "ArrowUp", "Home", "End"].includes(key)) {
      event.preventDefault();
      if (key === "Enter" || key === " ") {
        if (open) choose(active);
        else showMenu();
      } else if (key === "Home" || key === "End") {
        const index = key === "Home" ? 0 : projectTypes.length - 1;
        if (!open) showMenu(index);
        else setActive(index);
      } else if (!open) {
        const selected = projectTypes.findIndex((type) => type === value);
        showMenu(selected >= 0 ? selected : key === "ArrowUp" ? projectTypes.length - 1 : 0);
      } else setActive((index) => Math.max(0, Math.min(projectTypes.length - 1, index + (key === "ArrowDown" ? 1 : -1))));
      return;
    }
    if (key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
    event.preventDefault();
    const now = Date.now();
    const text = now - search.current.time < 600 ? search.current.text + key.toLowerCase() : key.toLowerCase();
    search.current = { text, time: now };
    const prefix = Array.from(text).every((letter) => letter === text[0]) ? text[0] : text;
    const start = prefix.length === 1 && open ? active + 1 : 0;
    const index = projectTypes.findIndex((_, offset) => projectTypes[(start + offset) % projectTypes.length].toLowerCase().startsWith(prefix));
    if (index < 0) return;
    const match = (start + index) % projectTypes.length;
    if (!open) showMenu(match);
    else setActive(match);
    search.current = { text, time: now };
  }

  useEffect(() => {
    if (!open) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(placeMenu);
    };
    const dismiss = (event: Event) => {
      if (event.target instanceof Node && !wrapper.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("focusin", dismiss);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("focusin", dismiss);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !menu.current) return;
    const option = menu.current.children[active] as HTMLElement | undefined;
    if (!option) return;
    const list = menu.current;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight)
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
  }, [active, open, placement.height]);

  return (
    <div className="project-type-select" ref={wrapper} data-open={open}>
      <button
        id="projectType"
        className="project-type-trigger flex items-center justify-between gap-4"
        type="button"
        role="combobox"
        ref={trigger}
        aria-labelledby="project-type-label"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? "project-type-options" : undefined}
        aria-activedescendant={open ? `project-type-option-${active}` : undefined}
        aria-required="true"
        aria-invalid={!!error}
        aria-describedby={error ? "type-error" : undefined}
        onClick={() => { if (open) setOpen(false); else showMenu(); }}
        onKeyDown={handleKey}
      >
        <span className={value ? undefined : "project-type-placeholder"}>{value || "Select a project type"}</span>
        <svg className="project-type-chevron shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="m3 5 4 4 4-4" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
      <input type="hidden" name="projectType" value={value} />
      {open && (
        <div
          id="project-type-options"
          className="project-type-options"
          role="listbox"
          aria-labelledby="project-type-label"
          ref={menu}
          data-side={placement.side}
          style={{ maxHeight: placement.height }}
        >
          {projectTypes.map((type, index) => (
            <div
              id={`project-type-option-${index}`}
              className="project-type-option flex items-center justify-between gap-4"
              key={type}
              role="option"
              aria-selected={value === type}
              data-active={active === index}
              onPointerMove={() => setActive(index)}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
            >
              <span>{type}</span>
              <svg className="project-type-check shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="m3 8 3 3 7-7" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

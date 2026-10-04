"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { lens as config, stageQuery } from "@/animations/config";

const enabledQuery = `${stageQuery} and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`;

/**
 * A small circular window that follows the pointer over the hero. The window
 * and its pre-scaled hero copy move by transform only: no clip-path, no
 * transform-origin changes and no DOM queries per frame. The loop runs only
 * while the pointer is moving inside the hero and stops when it settles.
 */
export function OpticalLens({ children }: { children: ReactNode }) {
  const lens = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glass = lens.current;
    const copy = content.current;
    const hero = document.getElementById("home");
    const drift = document.querySelector<HTMLElement>(".atmosphere-drift");
    if (!glass || !copy || !hero) return;
    const media = matchMedia(enabledQuery);
    const sx = config.scale;
    const sy = config.scale + config.stretch;
    let radius = 0;
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let visible = false;
    let attached = false;

    const measure = () => {
      width = document.documentElement.clientWidth;
      height = window.innerHeight;
      radius = Math.round(Math.min(95, Math.max(68, width * 0.055)));
      glass.style.width = glass.style.height = `${radius * 2}px`;
      copy.style.width = `${width}px`;
    };
    const render = () => {
      glass.style.transform = `translate3d(${x - radius}px, ${y - radius}px, 0)`;
      copy.style.transform = `translate3d(${radius - sx * x}px, ${radius - sy * y}px, 0) scale(${sx}, ${sy})`;
      if (drift)
        drift.style.transform = `translate3d(${(x / width - 0.5) * 18}px, ${(y / height - 0.5) * 12}px, 0)`;
    };
    const tick = (time: number) => {
      const elapsed = last ? Math.min(32, time - last) : 16.67;
      last = time;
      const rate = 1 - Math.pow(1 - config.follow, elapsed / 16.67);
      x += (tx - x) * rate;
      y += (ty - y) * rate;
      const settled = Math.abs(tx - x) + Math.abs(ty - y) < 0.15;
      if (settled) {
        x = tx;
        y = ty;
      }
      render();
      frame = settled ? 0 : requestAnimationFrame(tick);
      if (settled) last = 0;
    };
    const hide = () => {
      if (!visible) return;
      visible = false;
      glass.style.opacity = "0";
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };
    const move = (event: PointerEvent) => {
      if (
        event.pointerType !== "mouse" ||
        window.scrollY > height * 0.08 ||
        (event.target as Element).closest("a, button")
      ) {
        hide();
        return;
      }
      tx = event.clientX;
      ty = event.clientY;
      if (!visible) {
        visible = true;
        x = tx;
        y = ty;
        render();
        glass.style.opacity = "1";
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const visibility = () => {
      if (document.hidden) hide();
    };
    const attach = () => {
      if (attached) return;
      attached = true;
      measure();
      hero.addEventListener("pointermove", move, { passive: true });
      hero.addEventListener("pointerleave", hide);
      window.addEventListener("scroll", hide, { passive: true });
      window.addEventListener("resize", measure, { passive: true });
      window.addEventListener("blur", hide);
      document.addEventListener("visibilitychange", visibility);
    };
    const detach = () => {
      hide();
      if (!attached) return;
      attached = false;
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", hide);
      window.removeEventListener("scroll", hide);
      window.removeEventListener("resize", measure);
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", visibility);
      drift?.style.removeProperty("transform");
    };
    const update = () => (media.matches ? attach() : detach());
    update();
    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      detach();
    };
  }, []);

  return (
    <div className="optical-lens" ref={lens} aria-hidden="true">
      <div className="lens-content" ref={content}>
        {children}
      </div>
    </div>
  );
}

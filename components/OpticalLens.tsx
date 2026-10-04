"use client";
import { useEffect, useRef } from "react";
import { HeroType } from "@/sections/Hero";
import { desktopStageQuery, motion } from "@/animations/config";
export function OpticalLens() {
  const lens = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const rim = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia(
      `${desktopStageQuery} and (pointer: fine) and (prefers-reduced-motion: no-preference)`,
    );
    let frame = 0,
      x = 0,
      y = 0,
      tx = 0,
      ty = 0,
      lastTime = 0,
      visible = false;
    const hide = () => {
      visible = false;
      if (lens.current) lens.current.style.opacity = "0";
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    };
    const tick = (time: number) => {
      if (!visible || !lens.current || !copy.current || !rim.current) return;
      const elapsed = lastTime ? Math.min(32, time - lastTime) : 16.67;
      lastTime = time;
      const rate = 1 - Math.pow(1 - motion.lensInterpolation, elapsed / 16.67);
      x += (tx - x) * rate;
      y += (ty - y) * rate;
      const radius = Math.min(95, Math.max(68, innerWidth * 0.055));
      lens.current.style.clipPath = `circle(${radius}px at ${x}px ${y}px)`;
      copy.current.style.transformOrigin = `${x}px ${y}px`;
      copy.current.style.transform = `scale(${motion.lensScale}, ${motion.lensScale + 0.03})`;
      rim.current.style.width = rim.current.style.height = `${radius * 2}px`;
      rim.current.style.transform = `translate3d(${x - radius}px,${y - radius}px,0)`;
      const stage = document.querySelector<HTMLElement>(".atmosphere");
      stage?.style.setProperty(
        "--pointer-x",
        `${(x / innerWidth - 0.5) * 18}px`,
      );
      stage?.style.setProperty(
        "--pointer-y",
        `${(y / innerHeight - 0.5) * 12}px`,
      );
      frame =
        Math.abs(tx - x) + Math.abs(ty - y) > 0.15
          ? requestAnimationFrame(tick)
          : 0;
    };
    const move = (e: PointerEvent) => {
      const stage = document.querySelector<HTMLElement>(".experience");
      if (
        !media.matches ||
        window.scrollY > innerHeight * 0.08 ||
        e.pointerType !== "mouse" ||
        !stage ||
        !stage.contains(e.target as Node) ||
        (e.target as Element).closest("a,button,input,select,textarea")
      ) {
        hide();
        return;
      }
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        x = tx;
        y = ty;
        visible = true;
        if (lens.current) lens.current.style.opacity = "1";
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const visibility = () => {
      if (document.hidden) hide();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("blur", hide);
    document.addEventListener("pointerleave", hide);
    document.addEventListener("visibilitychange", visibility);
    media.addEventListener("change", hide);
    return () => {
      hide();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", hide);
      window.removeEventListener("blur", hide);
      document.removeEventListener("pointerleave", hide);
      document.removeEventListener("visibilitychange", visibility);
      media.removeEventListener("change", hide);
    };
  }, []);
  return (
    <>
      <div className="optical-lens" ref={lens} aria-hidden="true">
        <div className="lens-magnification" ref={copy}>
          <div className="atmosphere">
            <div className="atmosphere-shadow" />
            <div className="atmosphere-light" />
            <div className="atmosphere-fine" />
          </div>
          <HeroType />
        </div>
        <div className="lens-rim" ref={rim} />
      </div>
    </>
  );
}

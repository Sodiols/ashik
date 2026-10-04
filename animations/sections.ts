import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// The parent matchMedia context reverts all transforms and triggers together.
export function createSectionMotion(root: HTMLElement, desktop: boolean) {
  const about = root.querySelector<HTMLElement>(".about")!;
  const contact = root.querySelector<HTMLElement>(".contact")!;
  const content = contact.querySelector<HTMLElement>(".contact-content")!;
  const stage = root.querySelector<HTMLElement>(".experience")!;
  root.dataset.sectionsMotion = desktop ? "desktop" : "mobile";

  const aboutEntry = gsap.timeline({ scrollTrigger: {
    trigger: about, start: "top 94%", end: "top 18%", scrub: true, invalidateOnRefresh: true,
  }});
  aboutEntry
    .fromTo(about.querySelectorAll(".title-word"), {
      yPercent: desktop ? 90 : 60,
      xPercent: (index) => desktop ? (index ? 12 : -8) : 0,
    }, { yPercent: 0, xPercent: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" }, 0)
    .fromTo(about.querySelectorAll(".title-character"), { yPercent: 60 }, {
      yPercent: 0, duration: 0.65, stagger: 0.025, ease: "power3.out",
    }, 0.05)
    .fromTo(about.querySelectorAll(".section-topline > span"), { y: 12, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.4, stagger: 0.06,
    }, 0.1);

  gsap.fromTo(about.querySelectorAll(".copy-line > span,.about-description"), {
    y: desktop ? 24 : 12, opacity: 0,
  }, { y: 0, opacity: 1, stagger: 0.07, duration: 0.65, ease: "power3.out",
    scrollTrigger: { trigger: about.querySelector(".about-copy"), start: "top 94%", end: "top 72%", scrub: true, invalidateOnRefresh: true },
  });
  gsap.fromTo(about.querySelector(".about-light"), { xPercent: desktop ? -8 : -3 }, {
    xPercent: desktop ? 8 : 3, ease: "none",
    scrollTrigger: { trigger: about, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
  });
  gsap.fromTo(about.querySelector(".discipline-watermark"), { y: desktop ? 40 : 12 }, {
    y: desktop ? -40 : -12, ease: "none",
    scrollTrigger: { trigger: about.querySelector(".discipline-list"), start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
  });
  about.querySelectorAll(".discipline-list li").forEach((row) => {
    gsap.fromTo(row, { y: desktop ? 28 : 12, opacity: 0, "--rule-progress": 0 }, {
      y: 0, opacity: 1, "--rule-progress": 1, duration: 0.65, ease: "power3.out",
      scrollTrigger: { trigger: row, start: "top 94%", end: "top 72%", scrub: true, invalidateOnRefresh: true },
    });
  });

  const contactEntry = gsap.timeline({ scrollTrigger: {
    trigger: contact, start: "top 94%", end: "top 14%", scrub: true, invalidateOnRefresh: true,
  }});
  contactEntry
    .fromTo(contact.querySelectorAll(".contact-intro .title-word"), {
      yPercent: desktop ? 90 : 60,
      xPercent: (index) => desktop ? (index === 1 ? 10 : -6) : 0,
    }, { yPercent: 0, xPercent: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }, 0)
    .fromTo(contact.querySelectorAll(".section-topline > span,.contact-invitation"), { y: 18, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: "power2.out",
    }, 0.3);

  const contactArrow = contact.querySelector(".contact-arrow");
  if (contactArrow) {
    contactEntry
      .fromTo(contactArrow, { rotation: -40, scale: 0.75 }, {
        rotation: 0, scale: 1, duration: 0.6, ease: "power3.out",
      }, 0.24)
      .fromTo(contactArrow.querySelector(".connection-stroke"), { strokeDasharray: 1, strokeDashoffset: 1 }, {
        strokeDashoffset: 0, autoRound: false, duration: 0.65, ease: "power2.inOut",
      }, 0.25);

    gsap.fromTo(contactArrow.querySelector(".contact-arrow-ring"), { rotation: -90 }, {
      rotation: 90, ease: "none", immediateRender: false,
      scrollTrigger: { trigger: contact, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
    });
  }

  gsap.fromTo(stage, { "--background-exit": 0 }, {
    "--background-exit": 1, ease: "none",
    scrollTrigger: {
      trigger: about, start: "top bottom", end: "top 25%", scrub: true, invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (stage.dataset.enhanced !== "true") return;
        // Release the deck's wheel gestures once the visitor leaves Work.
        stage.dataset.scene = self.progress > 0 ? "about" : scrollY >= innerHeight * 0.98 ? "work" : "home";
      },
    },
  });

  // The inherited scalar separates rear planes first while the deck retains
  // ownership of each card's transform, blur, visibility and stacking order.
  if (desktop) {
    gsap.fromTo(root.querySelector(".project-stack"), { "--work-exit": 0 }, {
      "--work-exit": 1, ease: "none",
      scrollTrigger: { trigger: about, start: "top bottom", end: "top 25%", scrub: true, invalidateOnRefresh: true },
    });
    gsap.fromTo(root.querySelector(".stack-controls"), { y: 0, opacity: 1 }, {
      y: 22, opacity: 0, ease: "power1.in", immediateRender: false,
      scrollTrigger: { trigger: about, start: "top 95%", end: "top 65%", scrub: true, invalidateOnRefresh: true },
    });
    gsap.fromTo(root.querySelector(".work-intro"), { "--intro-exit": 0 }, {
      "--intro-exit": 1, ease: "none",
      scrollTrigger: { trigger: about, start: "top 90%", end: "top 35%", scrub: true, invalidateOnRefresh: true },
    });
    gsap.fromTo(about.querySelector(".discipline-resolution"), { xPercent: 0, y: 0, scale: 1 }, {
      xPercent: -8, y: -70, scale: 1.16, transformOrigin: "left center", ease: "power1.in", immediateRender: false,
      scrollTrigger: { trigger: contact, start: "top 88%", end: "top 28%", scrub: true, invalidateOnRefresh: true },
    });
  }

  // Time-based field entrances settle permanently as soon as editing begins.
  let editing = false;
  const fields = content.querySelectorAll(".form-field,.form-submit-row");
  const formEntry = gsap.timeline({ paused: true }).fromTo(fields, {
    y: desktop ? 24 : 12, opacity: 0,
  }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" });
  const finishForm = () => { editing = true; formEntry.progress(1).pause(); };
  const formTrigger = ScrollTrigger.create({
    trigger: content, start: "top 94%",
    onEnter: () => { if (!editing) formEntry.play(); },
    onLeaveBack: () => { if (!editing) formEntry.reverse(); },
    onRefresh: (self) => { if (self.progress > 0 || content.contains(document.activeElement)) formEntry.progress(1).pause(); },
  });
  if (formTrigger.progress > 0) formEntry.progress(1).pause();
  content.addEventListener("focusin", finishForm);

  const footer = root.querySelector<HTMLElement>(".footer")!;
  const footerEntry = gsap.fromTo(footer.querySelectorAll(":scope > span"), { y: 18, opacity: 0 }, {
    y: 0, opacity: 1, stagger: 0.05, duration: 0.55, ease: "power2.out",
    scrollTrigger: { trigger: footer, start: "top 98%", toggleActions: "play none none reverse" },
  });
  const finishFooter = () => { footerEntry.progress(1).pause(); };
  footer.addEventListener("focusin", finishFooter);
  return () => {
    content.removeEventListener("focusin", finishForm);
    footer.removeEventListener("focusin", finishFooter);
    delete root.dataset.sectionsMotion;
  };
}

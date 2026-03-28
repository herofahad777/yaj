import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function animateCards() {
  gsap.from(".problem-card", {
    scrollTrigger: {
      trigger: ".problem-grid",
      start: "top 80%",
    },
    y: 50,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: "power2.out",
  });
}

export function animateHero() {
  const tl = gsap.timeline();
  
  tl.from(".hero-title", {
    y: 30,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
  })
    .from(
      ".hero-subtitle",
      {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      },
      "-=0.4"
    )
    .from(
      ".hero-stats",
      {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      },
      "-=0.3"
    );
}

export function fadeIn(element: string, delay: number = 0) {
  gsap.from(element, {
    y: 20,
    opacity: 0,
    duration: 0.5,
    delay,
    ease: "power2.out",
  });
}

export function scaleIn(element: string, delay: number = 0) {
  gsap.from(element, {
    scale: 0.9,
    opacity: 0,
    duration: 0.4,
    delay,
    ease: "back.out(1.7)",
  });
}

export function slideIn(element: string, direction: "left" | "right" = "left", delay: number = 0) {
  const x = direction === "left" ? -50 : 50;
  
  gsap.from(element, {
    x,
    opacity: 0,
    duration: 0.5,
    delay,
    ease: "power2.out",
  });
}

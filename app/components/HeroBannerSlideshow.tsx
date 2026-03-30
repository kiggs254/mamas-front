"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./HeroBanner.module.css";

export type HeroSlide = {
  id: number;
  image: string;
  title?: string;
};

const ROTATE_MS = 7000;

export default function HeroBannerSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, ROTATE_MS);
    return () => window.clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className={styles.heroSlideshow} aria-hidden>
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={styles.heroSlide}
          data-active={i === index ? "true" : "false"}
        >
          <Image
            src={s.image}
            alt=""
            fill
            className={styles.heroSlideImg}
            sizes="100vw"
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  );
}

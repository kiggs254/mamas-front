"use client";

import type { StorefrontCategory } from "@/types/api";
import LiveSearch from "./LiveSearch";

type Props = {
  categories: StorefrontCategory[];
  className?: string;
};

export default function HeaderSearch({ categories, className }: Props) {
  return <LiveSearch variant="header" categories={categories} className={className} />;
}

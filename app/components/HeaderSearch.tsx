"use client";

import type { StorefrontCategory } from "@/types/api";
import LiveSearch from "./LiveSearch";

type Props = {
  categories: StorefrontCategory[];
};

export default function HeaderSearch({ categories }: Props) {
  return <LiveSearch variant="header" categories={categories} />;
}

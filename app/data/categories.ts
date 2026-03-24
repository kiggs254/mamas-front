export interface Category {
  id: number;
  name: string;
  count: number;
  color: string;
  icon: string;
}

export const categories: Category[] = [
  { id: 1, name: "Cake & Milk", count: 26, color: "#F2FCE4", icon: "🎂" },
  { id: 2, name: "Organic Kiwi", count: 28, color: "#FFFCEB", icon: "🥝" },
  { id: 3, name: "Peach", count: 14, color: "#ECFFEC", icon: "🍑" },
  { id: 4, name: "Red Apple", count: 54, color: "#FEEFEA", icon: "🍎" },
  { id: 5, name: "Snack", count: 56, color: "#FFF3EB", icon: "🍿" },
  { id: 6, name: "Vegetables", count: 72, color: "#FFF3FF", icon: "🥦" },
  { id: 7, name: "Strawberry", count: 36, color: "#F2FCE4", icon: "🍓" },
  { id: 8, name: "Black Plum", count: 123, color: "#FEEFEA", icon: "🫐" },
  { id: 9, name: "Custard Apple", count: 34, color: "#ECFFEC", icon: "🍏" },
  { id: 10, name: "Coffee & Tea", count: 89, color: "#FFFCEB", icon: "☕" },
];

export const navCategories = [
  "Deals",
  "Supply",
  "Dried Fruits",
  "Fresh Fruits",
  "Vegetables",
  "Juice",
  "Seafood",
  "Snacks",
  "Dairy",
  "Noodles",
];

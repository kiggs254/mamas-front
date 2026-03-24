export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  vendor: string;
  badge?: string;
  badgeColor?: string;
  image: string;
  sold?: number;
  total?: number;
  discount?: number;
  countdown?: { days: number; hours: number; mins: number; secs: number };
}

export const popularProducts: Product[] = [
  { id: 1, name: "All Natural Italian-Style Chicken Meatballs", category: "Snack", price: 238.85, oldPrice: 245.80, rating: 4, vendor: "NestFood", badge: "Hot", badgeColor: "#F74B81", image: "/images/products/product-1.png" },
  { id: 2, name: "Angie's Boomchickapop Sweet & Salty Kettle Corn", category: "Hodo Foods", price: 238.85, oldPrice: 245.80, rating: 4, vendor: "StarKist", image: "/images/products/product-2.png" },
  { id: 3, name: "Foster Farms Takeout Crispy Classic Buffalo Wings", category: "Snack", price: 238.85, oldPrice: 245.80, rating: 4, vendor: "NestFood", badge: "Sale", badgeColor: "#3BB77E", image: "/images/products/product-3.png" },
  { id: 4, name: "Blue Diamond Almonds Lightly Salted Vegetables", category: "Pet Foods", price: 238.85, oldPrice: 245.80, rating: 4, vendor: "NestFood", image: "/images/products/product-4.png" },
  { id: 5, name: "Chobani Complete Vanilla Greek Yogurt", category: "Hodo Foods", price: 238.85, oldPrice: 245.80, rating: 4, vendor: "NestFood", image: "/images/products/product-5.png" },
  { id: 6, name: "Canada Dry Ginger Ale – 2 L Bottle - 5 Notes Notes", category: "Meats", price: 238.85, oldPrice: 245.80, rating: 2, vendor: "Old El Paso", image: "/images/products/product-6.png" },
  { id: 7, name: "Encore Seafoods Stuffed Alaskan Salmon", category: "Snack", price: 238.85, oldPrice: 245.80, rating: 4, vendor: "NestFood", badge: "New", badgeColor: "#67BCEE", image: "/images/products/product-7.png" },
  { id: 8, name: "Gorton's Beer Battered Fish Fillets with soft paper", category: "Coffees", price: 238.85, oldPrice: 245.80, rating: 4, vendor: "Old El Paso", image: "/images/products/product-8.png" },
  { id: 9, name: "All Natural Italian-Style Chicken Meatballs", category: "Snack", price: 238.85, oldPrice: 245.80, rating: 4, vendor: "NestFood", badge: "Hot", badgeColor: "#F74B81", image: "/images/products/product-9.png" },
  { id: 10, name: "Simply Lemonade with Strawberry Fruit Juice", category: "Vegetables", price: 238.85, oldPrice: 245.80, rating: 3, vendor: "NestFood", image: "/images/products/product-10.png" },
];

export const dailyBestSells: Product[] = [
  { id: 11, name: "Organic Cage-Free Grade A Large Brown Eggs", category: "Snack", price: 238.85, oldPrice: 245.80, rating: 4, vendor: "NestFood", sold: 90, total: 120, image: "/images/products/product-1.png" },
  { id: 12, name: "Seeds of Change Organic Quinoa, Brown, & Red Rice", category: "Hodo Foods", price: 238.85, oldPrice: 245.80, rating: 4, vendor: "NestFood", sold: 65, total: 120, image: "/images/products/product-2.png" },
  { id: 13, name: "Naturally Flavored Cinnamon Vanilla Light Roast Coffee", category: "Pet Foods", price: 238.85, oldPrice: 245.80, rating: 4, vendor: "StarKist", sold: 72, total: 120, image: "/images/products/product-3.png" },
  { id: 14, name: "Carbonated Soft Drink daily needs refill pack", category: "Snack", price: 238.85, oldPrice: 245.80, rating: 4, vendor: "NestFood", sold: 45, total: 120, image: "/images/products/product-4.png" },
];

export const dealsOfDay: Product[] = [
  { id: 15, name: "Seeds of Change Organic Quinoa, Brown, & Red Rice", category: "Snack", price: 32.85, oldPrice: 33.80, rating: 4, vendor: "NestFood", countdown: { days: 426, hours: 8, mins: 17, secs: 41 }, image: "/images/products/product-5.png" },
  { id: 16, name: "Perdue Simply Smart Organics Gluten Free", category: "Vegetables", price: 24.85, oldPrice: 26.80, rating: 4, vendor: "Old El Paso", countdown: { days: 822, hours: 3, mins: 27, secs: 41 }, image: "/images/products/product-6.png" },
  { id: 17, name: "Signature Wood-Fired Mushroom and Caramelized", category: "Pizza", price: 12.85, oldPrice: 13.80, rating: 3, vendor: "NestFood", countdown: { days: 159, hours: 12, mins: 57, secs: 41 }, image: "/images/products/product-7.png" },
  { id: 18, name: "Simply Lemonade with Strawberry Fruit Juice", category: "Juices", price: 15.85, oldPrice: 19.80, rating: 4, vendor: "NestFood", countdown: { days: 37, hours: 5, mins: 22, secs: 41 }, image: "/images/products/product-8.png" },
];

export const topSelling: Product[] = [
  { id: 19, name: "Nestle Original Coffee-Mate Coffee Creamer", category: "Cream", price: 32.85, oldPrice: 33.80, rating: 4, vendor: "NestFood", image: "/images/products/product-1.png" },
  { id: 20, name: "Organic Cage-Free Grade A Large Brown Eggs", category: "Eggs", price: 32.85, oldPrice: 33.80, rating: 4, vendor: "NestFood", image: "/images/products/product-2.png" },
  { id: 21, name: "Seeds of Change Organic Quinoa, Brown Rice", category: "Rice", price: 32.85, oldPrice: 33.80, rating: 5, vendor: "NestFood", image: "/images/products/product-3.png" },
];

export const trendingProducts: Product[] = [
  { id: 22, name: "Organic Cage-Free Grade A Large Brown Eggs", category: "Eggs", price: 32.85, oldPrice: 33.80, rating: 4, vendor: "NestFood", image: "/images/products/product-4.png" },
  { id: 23, name: "Foster Farms Takeout Crispy Classic Buffalo", category: "Snack", price: 32.85, oldPrice: 33.80, rating: 4, vendor: "Old El Paso", image: "/images/products/product-5.png" },
  { id: 24, name: "Blue Diamond Almonds Lightly Salted", category: "Nuts", price: 32.85, oldPrice: 33.80, rating: 4, vendor: "NestFood", image: "/images/products/product-6.png" },
];

export const recentlyAdded: Product[] = [
  { id: 25, name: "Canada Dry Ginger Ale - 2 L Bottle - 5 Notes", category: "Drinks", price: 32.85, oldPrice: 33.80, rating: 4, vendor: "NestFood", image: "/images/products/product-7.png" },
  { id: 26, name: "Organic Frozen Triple Berry Blend", category: "Fruits", price: 32.85, oldPrice: 33.80, rating: 4, vendor: "NestFood", image: "/images/products/product-8.png" },
  { id: 27, name: "Oroweat Country Buttermilk Bread", category: "Bread", price: 32.85, oldPrice: 33.80, rating: 4, vendor: "NestFood", image: "/images/products/product-9.png" },
];

export const topRated: Product[] = [
  { id: 28, name: "Foster Farms Takeout Crispy Classic Buffalo", category: "Snack", price: 32.85, oldPrice: 33.80, rating: 5, vendor: "NestFood", image: "/images/products/product-10.png" },
  { id: 29, name: "Angie's Boomchickapop Sweet Kettle Corn", category: "Snack", price: 32.85, oldPrice: 33.80, rating: 4, vendor: "StarKist", image: "/images/products/product-1.png" },
  { id: 30, name: "All Natural Italian-Style Chicken Meatballs", category: "Meats", price: 32.85, oldPrice: 33.80, rating: 4, vendor: "NestFood", image: "/images/products/product-2.png" },
];

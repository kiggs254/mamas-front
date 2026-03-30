export type ApiEnvelope<T> = {
  status: string;
  data?: T;
  message?: string;
};

export type Customer = {
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
};

export type ProductImage = { id?: number; url?: string; alt?: string | null; order?: number };
export type ProductVariant = {
  id: number;
  product_id?: number;
  sku?: string;
  price?: string | number;
  sale_price?: string | number | null;
};

export type StorefrontCategory = {
  id: number;
  name: string;
  slug?: string;
  parent_id?: number | null;
  age_restricted?: boolean;
  /** Category thumbnail (often `/uploads/...`); use with resolveMediaUrl */
  image?: string | null;
  children?: StorefrontCategory[];
};

export type StorefrontProduct = {
  id: number;
  name: string;
  slug?: string;
  sku?: string;
  age_restricted?: boolean;
  description?: string | null;
  price: string | number;
  sale_price?: string | number | null;
  status?: string;
  is_featured?: boolean;
  category?: StorefrontCategory | null;
  categories?: StorefrontCategory[];
  brand?: { id: number; name: string; slug?: string } | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
  tags?: { id: number; name: string; slug?: string }[];
  reviews?: Review[];
  sold_count?: number | null;
  stock?: number | null;
  quantity?: number | null;
};

export type CartLine = {
  id: number;
  product_id: number;
  variant_id?: number | null;
  quantity: number;
  product?: StorefrontProduct;
  variant?: ProductVariant | null;
};

export type Review = {
  id: number;
  product_id?: number;
  rating: number;
  title?: string | null;
  comment?: string | null;
  status?: string;
  customer?: { first_name?: string; last_name?: string };
  created_at?: string;
};

export type Banner = {
  id: number;
  title?: string;
  image_url?: string;
  /** Backend field; also exposed as link_url in some clients */
  link?: string;
  link_url?: string;
  position?: string;
};

export type HomepageSection = {
  id: string;
  type: string;
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  layout?: string;
  config?: Record<string, unknown>;
};

export type MenuItem = {
  id: number;
  label: string;
  url?: string;
  children?: MenuItem[];
};

export type StoreMenu = {
  id: number;
  name?: string;
  position?: string;
  items?: MenuItem[];
};

export type ShopSettings = Record<string, string>;

export type ShippingMethod = {
  id: number;
  name: string;
  type?: string;
  cost?: string | number;
  enabled?: boolean;
};

export type PaymentGatewayPublic = {
  id: number;
  name: string;
  config?: Record<string, unknown>;
};

export type OrderSummary = {
  id: number;
  order_number?: string;
  status?: string;
  payment_status?: string;
  total?: string | number;
  currency?: string;
  created_at?: string;
  items?: unknown[];
};

export type CustomerAddress = {
  id: number;
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string | null;
  city?: string;
  state?: string | null;
  postal_code?: string | null;
  country?: string;
  is_default?: boolean;
};

export type StorePage = {
  id: number;
  title: string;
  slug: string;
  content?: string;
  status?: string;
};

export type SubscriptionPackage = {
  id: number;
  name: string;
  price?: string | number;
  weekly_price?: string | number;
  status?: string;
  items?: unknown[];
};

export type SubscriptionRow = {
  id: number;
  status?: string;
  package?: { name?: string; price?: string | number };
  next_delivery_date?: string;
  next_payment_date?: string;
};

export type BrandRow = { id: number; name: string; slug?: string };
export type TagRow = { id: number; name: string; slug?: string };

/** Public store-locator / branch list (Appearance → Branches) */
export type StoreLocatorBranch = {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone?: string;
  hours?: string;
};

export type StoreLocatorConfig = {
  enabled: boolean;
  googleMapsApiKey?: string;
  stores: StoreLocatorBranch[];
};

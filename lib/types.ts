export type Role = "owner" | "staff";

export interface Profile {
  id: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  category_id: string | null;
  supplier_id: string | null;
  unit: string;
  price: number;
  cost: number | null;
  quantity: number;
  low_stock_threshold: number;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
  categories?: { name: string } | null;
  suppliers?: { name: string } | null;
}

export interface Sale {
  id: string;
  sold_at: string;
  total: number;
  created_by: string | null;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface SupplierPayment {
  id: string;
  supplier_id: string;
  amount: number;
  note: string | null;
  paid_at: string;
  suppliers?: { name: string } | null;
}

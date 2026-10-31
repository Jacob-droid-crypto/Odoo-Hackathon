export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export type ProductType = 'SOFTWARE' | 'ADDON' | 'SERVICE' | 'PHYSICAL';

export type BillingInterval = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export type SubscriptionStatus =
  | 'DRAFT'
  | 'QUOTATION'
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'CLOSED';

export type QuotationStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'EXPIRED'
  | 'CANCELLED';

export type InvoiceStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PAID'
  | 'CANCELLED'
  | 'OVERDUE';

export type DiscountType = 'FIXED' | 'PERCENTAGE';
export type DiscountTarget = 'PRODUCT' | 'SUBSCRIPTION' | 'INVOICE';

export type PaymentMethod =
  | 'CREDIT_CARD'
  | 'BANK_TRANSFER'
  | 'STRIPE'
  | 'CASH'
  | 'OTHER';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  companyName?: string | null;
  phone?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  variantName: string;
  attributeName: string;
  attributeValue: string;
  priceExtra: number | string;
  sku?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionPlan {
  id: string;
  productId: string;
  name: string;
  code: string;
  description?: string | null;
  price: number | string;
  billingInterval: BillingInterval;
  intervalCount: number;
  minQuantity: number;
  startDate?: string | null;
  endDate?: string | null;
  autoClose: boolean;
  allowEarlyClose: boolean;
  allowPause: boolean;
  allowRenew: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  product?: Product;
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  salesPrice: number | string;
  costPrice: number | string;
  notes?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  variants?: ProductVariant[];
  plans?: SubscriptionPlan[];
}

// Coordinated Models (Member 3 / 4 scopes)
export interface QuotationLine {
  id: string;
  quotationId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
  product?: Product;
  variant?: ProductVariant | null;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  planId: string;
  status: QuotationStatus;
  validUntilDays: number;
  expirationDate: string;
  notes?: string | null;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  customer?: User;
  plan?: SubscriptionPlan;
  lines?: QuotationLine[];
}

export interface SubscriptionLine {
  id: string;
  subscriptionId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
  product?: Product;
  variant?: ProductVariant | null;
}

export interface Subscription {
  id: string;
  subscriptionNumber: string;
  customerId: string;
  planId: string;
  quotationId?: string | null;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate?: string | null;
  nextBillingDate?: string | null;
  paymentTerms?: string | null;
  autoRenew: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: User;
  plan?: SubscriptionPlan;
  lines?: SubscriptionLine[];
}

export interface TaxRule {
  id: string;
  name: string;
  ratePercentage: number;
  description?: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountRule {
  id: string;
  code: string;
  description?: string | null;
  type: DiscountType;
  value: number;
  minPurchase?: number | null;
  minQuantity?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  maxUses?: number | null;
  usedCount: number;
  targetType: DiscountTarget;
  targetProductId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  productId?: string | null;
  variantId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  discountAmount: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  subscriptionId?: string | null;
  customerId: string;
  status: InvoiceStatus;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  totalAmount: number;
  issuedDate: string;
  dueDate: string;
  paidAt?: string | null;
  notes?: string | null;
  customer?: User;
  subscription?: Subscription | null;
  lines?: InvoiceLine[];
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentDate: string;
  referenceNote?: string | null;
  invoice?: Invoice;
  customer?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponseData {
  token: string;
  user: User;
}

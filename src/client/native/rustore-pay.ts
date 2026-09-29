import { registerPlugin } from "@capacitor/core";

// Our own bridge to RuStore Pay SDK, android/app/.../RuStorePayPlugin.java:
// RuStore ships no Capacitor wrapper. Only what a subscription needs is
// exposed. Whether a subscription is active is the server's call; the SDK
// here buys and lists, it does not grant access.

export interface RuStoreProduct {
  productId: string;
  type: "SUBSCRIPTION" | "NON_CONSUMABLE_PRODUCT" | "CONSUMABLE_PRODUCT";
  title: string;
  description: string | null;
  // Ready to show, formatted by RuStore.
  amountLabel: string;
  // In minor units, kopecks for RUB.
  price: number | null;
  currency: string;
  // ISO 8601 durations, e.g. P7D and P1M.
  trialPeriod?: string;
  period?: string;
}

export interface RuStorePurchase {
  purchaseId: string;
  invoiceId: string;
  productId: string;
  sandbox: boolean;
}

export interface RuStoreSubscription extends RuStorePurchase {
  status:
    | "INVOICE_CREATED"
    | "CANCELLED"
    | "EXPIRED"
    | "PROCESSING"
    | "REJECTED"
    | "ACTIVE"
    | "PAUSED"
    | "TERMINATED"
    | "CLOSED";
  expiresAt: number | null;
  gracePeriodEnabled: boolean;
}

interface RuStorePayPlugin {
  checkAvailability(): Promise<{ available: boolean; reason?: string }>;
  getProducts(options: {
    ids: string[];
  }): Promise<{ products: RuStoreProduct[] }>;
  // Rejects with code "cancelled" when the person closes the payment sheet.
  purchase(options: {
    productId: string;
    appUserId?: string;
  }): Promise<RuStorePurchase>;
  getSubscriptions(): Promise<{ subscriptions: RuStoreSubscription[] }>;
}

export const RuStorePay = registerPlugin<RuStorePayPlugin>("RuStorePay");

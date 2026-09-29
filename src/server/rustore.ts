import { createPrivateKey, createSign, type KeyObject } from "node:crypto";

// RuStore Public API, only the parts a subscription needs.
// https://www.rustore.ru/help/work-with-rustore-api/

const API_URL = "https://public-api.rustore.ru/public";

// Refresh a little before RuStore does, so a request never leaves with a
// token that expires on the way.
const TOKEN_MARGIN_MS = 60_000;

export interface RuStoreSubscription {
  startsAt: Date;
  expiresAt: Date;
  autoRenewing: boolean;
  // 0 pending, 1 paid, 2 free trial.
  paymentState: number;
}

export class RuStoreError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Signs keyId + timestamp with SHA512withRSA, as /public/auth/ expects. The
// private key comes from the console base64-encoded PKCS#8 DER, without PEM
// armour.
export function signAuthRequest(
  keyId: string,
  privateKey: KeyObject,
  now: Date,
) {
  const timestamp = now.toISOString();
  const signature = createSign("RSA-SHA512")
    .update(keyId + timestamp)
    .sign(privateKey, "base64");
  return { keyId, timestamp, signature };
}

export function parsePrivateKey(base64: string): KeyObject {
  return createPrivateKey({
    key: Buffer.from(base64, "base64"),
    format: "der",
    type: "pkcs8",
  });
}

export function createRuStoreClient(options: {
  keyId: string;
  privateKey: KeyObject;
  fetch?: typeof fetch;
  now?: () => Date;
}) {
  const {
    keyId,
    privateKey,
    fetch = globalThis.fetch,
    now = () => new Date(),
  } = options;
  let token: { jwe: string; expiresAt: number } | null = null;

  async function call<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, init);
    const json = (await response.json().catch(() => null)) as {
      code?: string;
      message?: string;
      body?: T;
    } | null;
    // Uploads and commits answer with no body at all, so only the code counts.
    if (!response.ok || json?.code !== "OK") {
      throw new RuStoreError(
        response.status,
        json?.message ?? `RuStore ${path} answered ${response.status}`,
      );
    }
    return json.body as T;
  }

  async function authToken() {
    const time = now();
    if (token && token.expiresAt - TOKEN_MARGIN_MS > time.getTime()) {
      return token.jwe;
    }
    const body = await call<{ jwe: string; ttl: number }>("/auth/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signAuthRequest(keyId, privateKey, time)),
    });
    token = { jwe: body.jwe, expiresAt: time.getTime() + body.ttl * 1000 };
    return token.jwe;
  }

  // Any Public API method, authorized.
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Public-Token", await authToken());
    return call<T>(path, { ...init, headers });
  }

  // Works only with subscriptions bought through Pay SDK. Test purchases
  // live in a separate sandbox, so the caller has to say which one it is.
  async function getSubscription(params: {
    packageName: string;
    productId: string;
    purchaseId: string;
    sandbox: boolean;
  }): Promise<RuStoreSubscription> {
    const path = [
      params.sandbox ? "/sandbox/v5/subscription" : "/v5/subscription",
      params.packageName,
      params.productId,
      params.purchaseId,
    ]
      .map((part, index) => (index === 0 ? part : encodeURIComponent(part)))
      .join("/");

    const body = await request<{
      startTimeMillis: string;
      expiryTimeMillis: string;
      autoRenewing: boolean;
      paymentState: number;
    }>(path);

    return {
      startsAt: new Date(Number(body.startTimeMillis)),
      expiresAt: new Date(Number(body.expiryTimeMillis)),
      autoRenewing: body.autoRenewing,
      paymentState: body.paymentState,
    };
  }

  return { request, getSubscription };
}

export type RuStoreClient = ReturnType<typeof createRuStoreClient>;

import { createVerify, generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createRuStoreClient, signAuthRequest } from "./rustore.ts";

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

describe("signAuthRequest", () => {
  it("signs key id and timestamp so RuStore can check them", () => {
    const request = signAuthRequest(
      "354751",
      privateKey,
      new Date("2026-09-29T11:00:00.123Z"),
    );

    expect(request.timestamp).toBe("2026-09-29T11:00:00.123Z");
    const valid = createVerify("RSA-SHA512")
      .update("354751" + request.timestamp)
      .verify(publicKey, request.signature, "base64");
    expect(valid).toBe(true);
  });
});

describe("getSubscription", () => {
  function setup() {
    const requests: { url: string; token: string | null }[] = [];
    let time = new Date("2026-09-29T11:00:00Z");

    const fetch = async (url: string | URL | Request, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      requests.push({ url: String(url), token: headers.get("Public-Token") });
      const body = String(url).endsWith("/auth/")
        ? { jwe: `jwe-${requests.length}`, ttl: 900 }
        : {
            startTimeMillis: "1790000000000",
            expiryTimeMillis: "1792592000000",
            autoRenewing: true,
            paymentState: 2,
          };
      return Response.json({ code: "OK", body });
    };

    const client = createRuStoreClient({
      keyId: "354751",
      privateKey,
      fetch: fetch as typeof globalThis.fetch,
      now: () => time,
    });
    const advance = (ms: number) => {
      time = new Date(time.getTime() + ms);
    };
    return { client, requests, advance };
  }

  const purchase = {
    packageName: "ru.ashlanderr.gymtracker",
    productId: "premium_month",
    purchaseId: "550e8400-e29b-41d4-a716-446655440000",
    sandbox: false,
  };

  it("asks with a token and reads the expiry", async () => {
    const { client, requests } = setup();

    const subscription = await client.getSubscription(purchase);

    expect(subscription.expiresAt).toEqual(new Date(1792592000000));
    expect(requests.map((r) => r.url)).toEqual([
      "https://public-api.rustore.ru/public/auth/",
      "https://public-api.rustore.ru/public/v5/subscription/ru.ashlanderr.gymtracker/premium_month/550e8400-e29b-41d4-a716-446655440000",
    ]);
    expect(requests[1].token).toBe("jwe-1");
  });

  it("reuses the token until it is about to expire", async () => {
    const { client, requests, advance } = setup();

    await client.getSubscription(purchase);
    advance(10 * 60_000);
    await client.getSubscription(purchase);
    advance(5 * 60_000);
    await client.getSubscription({ ...purchase, sandbox: true });

    const auths = requests.filter((r) => r.url.endsWith("/auth/"));
    expect(auths).toHaveLength(2);
    expect(requests.at(-1)?.url).toContain("/public/sandbox/v5/subscription/");
  });
});

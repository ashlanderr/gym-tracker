import type { OAuth2Tokens } from "better-auth";
import type { VkOption, VkProfile } from "better-auth/social-providers";

// Wide enough for the largest avatar the app draws, 88px, on a 3x screen.
const AVATAR_SIZE = 264;

// VK ID hands out a 50x50 avatar, blurry on any phone. The same address serves
// every size listed in its `as` parameter, picked by `cs`.
export function largerAvatar(avatar: string | undefined): string | undefined {
  if (!avatar) return avatar;
  const url = new URL(avatar);
  const sizes = (url.searchParams.get("as") ?? "")
    .split(",")
    .map((size) => ({ size, width: Number.parseInt(size, 10) }))
    .filter(({ width }) => width > 0)
    .sort((a, b) => a.width - b.width);
  if (sizes.length === 0) return avatar;

  const fitting = sizes.find(({ width }) => width >= AVATAR_SIZE);
  url.searchParams.set("cs", (fitting ?? sizes[sizes.length - 1]).size);
  return url.href;
}

// The built-in provider asks VK from Node without Accept-Language, and VK
// answers with the latin transliteration of the name.
async function getUserInfo(tokens: OAuth2Tokens, clientId: string) {
  if (!tokens.accessToken) return null;

  const response = await fetch("https://id.vk.com/oauth2/user_info", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept-Language": "ru",
    },
    body: new URLSearchParams({
      access_token: tokens.accessToken,
      client_id: clientId,
    }),
  });
  if (!response.ok) return null;

  const profile = (await response.json()) as VkProfile;
  if (!profile.user.email) return null;

  return {
    user: {
      name: `${profile.user.first_name} ${profile.user.last_name}`,
      email: profile.user.email,
      image: largerAvatar(profile.user.avatar),
      emailVerified: false,
    },
    data: profile,
  };
}

export function vkOptions(clientId: string, clientSecret: string): VkOption {
  return {
    clientId,
    clientSecret,
    disableDefaultScope: true,
    scope: ["email"],
    getUserInfo: (tokens) => getUserInfo(tokens, clientId),
    // Keeps the name and the avatar in step with VK.
    overrideUserInfoOnSignIn: true,
  };
}

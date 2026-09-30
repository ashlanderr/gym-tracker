import type { OAuth2Tokens } from "better-auth";
import type { VkOption, VkProfile } from "better-auth/social-providers";
import { logVk } from "./vk-log.ts";

const VK_API_VERSION = "5.199";

interface VkApiPhotos {
  photo_200?: string;
  photo_400_orig?: string;
  photo_max_orig?: string;
}

// The avatar in VK ID's user_info is 50x50, blurry on any phone; VK API has
// it in fixed sizes. Should it refuse the VK ID token, the small one stays.
async function apiAvatar(accessToken: string): Promise<string | undefined> {
  try {
    const response = await fetch("https://api.vk.com/method/users.get", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        access_token: accessToken,
        fields: "photo_200,photo_400_orig,photo_max_orig",
        v: VK_API_VERSION,
      }),
    });
    const body = (await response.json()) as {
      response?: VkApiPhotos[];
      error?: { error_code: number; error_msg: string };
    };
    if (body.error) {
      logVk("users.get failed", { status: response.status, ...body.error });
      return undefined;
    }
    const photos = body.response?.[0] ?? {};
    logVk("users.get photos", { ...photos });
    return photos.photo_400_orig ?? photos.photo_200 ?? photos.photo_max_orig;
  } catch (error) {
    logVk("users.get unreachable", { error: String(error) });
    return undefined;
  }
}

// The built-in provider asks VK from Node without Accept-Language, and VK
// answers with the latin transliteration of the name.
async function getUserInfo(tokens: OAuth2Tokens, clientId: string) {
  if (!tokens.accessToken) {
    logVk("user_info skipped: no access token");
    return null;
  }

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
  if (!response.ok) {
    logVk("user_info failed", { status: response.status });
    return null;
  }

  const profile = (await response.json()) as VkProfile;
  // Which fields came, not what they hold: names, email and phone are
  // personal data and stay out of the logs.
  logVk("user_info", {
    vkUserId: profile.user.user_id,
    fields: Object.keys(profile.user),
    avatar: profile.user.avatar,
  });
  if (!profile.user.email) {
    logVk("user_info has no email, sign-in refused");
    return null;
  }

  const fromApi = await apiAvatar(tokens.accessToken);
  const image = fromApi ?? profile.user.avatar;
  logVk("avatar chosen", {
    source: fromApi ? "users.get" : "user_info",
    image,
  });

  return {
    user: {
      name: `${profile.user.first_name} ${profile.user.last_name}`,
      email: profile.user.email,
      image,
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

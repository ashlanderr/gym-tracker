import type { OAuth2Tokens } from "better-auth";
import type { VkOption, VkProfile } from "better-auth/social-providers";

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
      image: profile.user.avatar,
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

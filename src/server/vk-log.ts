// One line per step of the VK sign-in, so that a failure on a phone can be
// read from `docker logs` afterwards. Tokens, names, email and phone never go
// in: they are credentials or personal data.
export function logVk(event: string, details: Record<string, unknown> = {}) {
  console.log(`[vk] ${event}`, JSON.stringify(details));
}

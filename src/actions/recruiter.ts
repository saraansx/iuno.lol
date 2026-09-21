"use server";

import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { profileUpdateRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import {
  RECRUITER_REQUIRED,
  getOrCreateInvite,
  refreshRecruiter,
  type RecruiterState,
} from "@/lib/recruiter";

async function requireLinkedUser(): Promise<{ userId: number; discordId: string }> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  const rate = await profileUpdateRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    throw new Error(`You're updating too fast. Please wait ${minutes} minute${minutes === 1 ? "" : "s"}.`);
  }

  const user = await getUserById(userId);
  if (!user?.discordId) throw new Error("Connect your Discord account first.");
  return { userId, discordId: user.discordId };
}

// Fixed personal invite link + live use count (no grant — view only).
export async function getMyInvite(): Promise<Omit<RecruiterState, "granted"> & { required: number }> {
  const { userId } = await requireLinkedUser();
  const { code, uses } = await getOrCreateInvite(userId);
  return { code, url: `https://discord.gg/${code}`, uses, required: RECRUITER_REQUIRED };
}

// Poll uses; grant role + badge once the threshold is hit.
export async function checkRecruiterProgress(): Promise<RecruiterState> {
  const { userId, discordId } = await requireLinkedUser();
  const state = await refreshRecruiter(userId, discordId);
  if (state.granted) {
    const user = await getUserById(userId);
    if (user?.username) revalidatePath(`/${user.username}`);
  }
  return state;
}

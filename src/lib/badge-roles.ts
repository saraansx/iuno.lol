export const ROLE_BADGE_MAP: Record<string, string> = {
  "1550685500627488798": "owner",
  "1538628583726260234": "developer",
  "1548832598862860378": "staff",
  "1550685858330447902": "helper",
  "1550686015121788949": "verified",
  "1550686885540536390": "bug-hunter",
  "1550686314049839204": "premium",
  "1550686691260502176": "donator",
  "1550686511186321518": "image-host",
  "1550687212939645058": "domain",
  "1550687358444114042": "gifter",
  "1543209999835209778": "booster",
  "1543221094792822884": "guild-tag",
  "1550687676007587950": "featured",
  "1550687470436225076": "suggestor",
  "1550687797046812763": "discord-recruiter",
  "1549587322834526328": "level-10",
  "1550934540824870912": "level-20",
  "1550934747356598283": "level-30",
  "1550934640385331230": "level-40",
  "1550934783075553402": "level-50",
  "1564233009320693830": "early",
};

export const BADGE_ROLE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(ROLE_BADGE_MAP).map(([roleId, badgeId]) => [badgeId, roleId])
);

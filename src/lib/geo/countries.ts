import isoCountries from "i18n-iso-countries";

export function alpha2ToNumeric(code: string): string | null {
  const n = isoCountries.alpha2ToNumeric(code.toUpperCase());
  return n ? String(n) : null;
}

let displayNames: Intl.DisplayNames | null = null;
function regionNames(): Intl.DisplayNames | null {
  if (displayNames) return displayNames;
  try {
    displayNames = new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    displayNames = null;
  }
  return displayNames;
}

export function countryName(code: string): string {
  const upper = code.toUpperCase();
  try {
    return regionNames()?.of(upper) ?? upper;
  } catch {
    return upper;
  }
}

export function flagEmoji(code: string): string {
  const upper = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return "";
  return String.fromCodePoint(...[...upper].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Single source for contact details — update here only. */

/** The phone number, written once. Every other form of it below is worked out from this. */
const phone = "0509700059";
const intl = phone.replace(/^0/, "972");

/** For tel: links. */
export const phoneTel = phone;
/** As people read it: 050-9700059 (assumes a mobile number with a 3-digit prefix). */
export const phoneDisplay = `${phone.slice(0, 3)}-${phone.slice(3)}`;
/** International form for structured data: +972509700059. */
export const phoneE164 = `+${intl}`;
export const whatsappLink = `https://wa.me/${intl}`;

export const instagramLink = "https://www.instagram.com/ilaybuilds/";

/**
 * FormSubmit alias of Ilay's Gmail address, so the contact form does not carry the address in the page source.
 * A different email address needs a new alias from formsubmit.co.
 */
export const formsubmitId = "2e140fc350a50fa7e0bcf4328e4d6ee3";

/** Other names search engines should tie to the same person (structured data only). */
export const alternateNames = ["Ilay Sandrusi", "ILAYBUILDS"];

/** One fixed description of the person and the business, the same on every page (structured data). */
export const siteDescription =
  "אני איליי. בונה אתרים, דפי נחיתה וחנויות אונליין לעסקים. בודק תוכנה במקצוע, אז אני בונה בדיוק את מה שאחרים מפספסים.";

/**
 * The "what are we building" choices and the plans they open, in one place.
 *
 * To change a plan: edit it below. Its number, the hint on each choice ("מסלולים 1–3"),
 * the button text and the WhatsApp message are worked out from this list.
 * To open a plan for a choice: add the choice id to the plan's `fit`.
 *
 * Written by hand, so check them when you reorder or insert plans:
 * - descriptions that mention another plan by number ("הכול ממסלול 1", "מסלול 2, ועוד...").
 * The desktop layout shows the plans in one row of 4 (2 per row from 900px), and the custom plan stays last.
 */

export type ChoiceId = "ecommerce" | "landing" | "unique";

export type Choice = {
  id: ChoiceId;
  title: string;
  text: string;
  /** SVG markup, 24×24 viewBox, drawn with currentColor. */
  icon: string;
};

export type Plan = {
  name: string;
  tag: string;
  outcome: string;
  text: string;
  items: string[];
  /** The choices this plan fits. */
  fit: ChoiceId[];
  /** The plan with the dark card and the primary button. */
  featured?: boolean;
  /** Button text and WhatsApp message when the default ones do not fit (the custom plan). */
  cta?: string;
  wa?: string;
};

export const choices: Choice[] = [
  {
    id: "ecommerce",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14l-1.5 9h-11z"/><path d="M9 7a3 3 0 0 1 6 0"/><circle cx="9.5" cy="19.5" r="1"/><circle cx="15" cy="19.5" r="1"/></svg>',
    title: "חנות אונליין",
    text: "קטלוג, סליקה וסדר מההתחלה.",
  },
  {
    id: "landing",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h5"/><path d="M8 16h4" style="stroke: var(--accent)"/></svg>',
    title: "דף נחיתה",
    text: "עמוד אחד שמביא פנייה.",
  },
  {
    id: "unique",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.2 5.3L20 9l-4.3 3.8L17 18.5 12 15.6 7 18.5l1.3-5.7L4 9l5.8-.7z"/></svg>',
    title: "משהו אחר",
    text: "תגידו מה צריך ונבנה מסלול משלנו.",
  },
];

export const plans: Plan[] = [
  {
    name: "אתר עד שאתם מרוצים",
    tag: "מסלול בסיסי",
    outcome: "אתר מוכן להשקה, בלי לעצור באמצע.",
    text: "בונים עד שזה מרגיש נכון. אני בודק, ואז משחרר לאוויר.",
    items: ["אפיון ועיצוב", "בנייה עד שאתם מרוצים", "בדיקות תוכנה", "השקה"],
    fit: ["ecommerce", "landing"],
  },
  {
    name: "אתר + תחזוקה חודשית",
    tag: "עם ליווי",
    outcome: "האתר חי, ואני נשאר איתו אחרי ההשקה.",
    text: "מסלול 1, ועוד ליווי חודשי: בדיקות, עדכוני גרסה ותיקונים קטנים.",
    items: ["הכול ממסלול 1", "בדיקות חודשיות", "עדכוני גרסה", "תיקונים קטנים"],
    fit: ["ecommerce", "landing"],
  },
  {
    name: "אתר + תחזוקה + אוטומציות",
    tag: "מסלול מלא",
    outcome: "אתר עם חיבורים שעובדים ברקע.",
    text: "מסלול 2, ועוד חיבורים לטפסים, וואטסאפ ומערכות.",
    items: ["הכול ממסלול 2", "אוטומציות וחיבורים", "טפסים והתראות", "תחזוקה שוטפת"],
    fit: ["ecommerce"],
  },
  {
    name: "נתאים יחד",
    tag: "מסלול אישי",
    outcome: "רק מה שאתם צריכים, לפי היקף ותקציב.",
    text: "נשב, נבין מה צריך, ונבנה מסלול משלכם.",
    items: ["שיחת היכרות", "התאמה להיקף ולתקציב", "רק מה שצריך"],
    fit: ["unique"],
    featured: true,
    cta: "דברו איתי על מסלול אישי",
    wa: "היי איליי, לא מצאתי מסלול שמתאים. רוצה לבנות משהו משלנו.",
  },
];

/** Plan number as people read it: 1, 2, 3… (also the big number on the card). */
export const planNumber = (plan: Plan) => plans.indexOf(plan) + 1;

export const planButtonText = (plan: Plan) => plan.cta ?? `דברו איתי על מסלול ${planNumber(plan)}`;

export const planWhatsappText = (plan: Plan) =>
  plan.wa ?? `היי איליי, מעניין אותי מסלול ${planNumber(plan)}, ${plan.name}`;

/** "מסלולים 1–3", "מסלולים 1, 3" or "מסלול 4 בלבד", from the plans that fit the choice. */
export const choiceHint = (id: ChoiceId) => {
  const nums = plans.filter((p) => p.fit.includes(id)).map(planNumber);
  if (nums.length === 0) return "";
  if (nums.length === 1) return `מסלול ${nums[0]} בלבד`;
  const consecutive = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1);
  return consecutive ? `מסלולים ${nums[0]}–${nums[nums.length - 1]}` : `מסלולים ${nums.join(", ")}`;
};

# בניית אתרים · איליי סנדרוסי

אתר עסקי בעברית (RTL), חוויית סצנות + בחירה אינטראקטיבית. נבנה ב-Astro ונפרס ל-GitHub Pages.

**לייב:** https://ilaysandrusi.github.io/ilay_sandrusi_website/

## מבנה

```text
src/
├── data/
│   ├── site.ts          # שם האתר, כתובת הבסיס ועזרים לקישורים
│   ├── contact.ts       # טלפון, וואטסאפ, אינסטגרם, מזהה הטופס
│   ├── nav.ts           # הסקשנים של דף הבית (התפריט והפוטר)
│   ├── plans.ts         # אפשרויות הבחירה והמסלולים
│   ├── projects.ts      # תיק העבודות
│   └── guides.ts        # רשימת המדריכים לבלוג
├── layouts/Layout.astro # head, פונטים, נתונים לגוגל
├── styles/global.css    # צבעים, ריווח, כפתורים, כותרות סקשנים
├── components/
│   ├── Header.astro, Footer.astro, MobileBar.astro
│   ├── SceneOpen.astro      # פתיחה: החלון עם הדמות
│   ├── SceneWork.astro      # תיק עבודות (קרוסלה כשאין עדיין פרויקטים)
│   ├── SceneAbout.astro     # מה חשוב לדעת עליי
│   ├── SceneChoose.astro    # מה בונים עכשיו?
│   ├── ScenePlans.astro     # מסלולים + וואטסאפ
│   ├── SceneContact.astro   # טופס יצירת קשר (FormSubmit)
│   └── RopeClimber.astro    # הדמות שיורדת בחבל לכפתור השליחה
├── scripts/                 # hero-window.ts (החלון), rope-descent.ts (החבל)
├── content/guides/          # המדריכים בבלוג, קובץ Markdown לכל מדריך
└── pages/                   # index, blog, 404, sitemap.xml
```

## עדכונים נפוצים

- **טלפון, וואטסאפ, אינסטגרם:** `src/data/contact.ts`. את מספר הטלפון כותבים פעם אחת; קישור הוואטסאפ והצורות האחרות נגזרים ממנו.
- **מסלול או אפשרות בחירה:** `src/data/plans.ts`. המספר של כל מסלול, הרמז על כל בחירה ("מסלולים 1–3") והודעת הוואטסאפ מחושבים לבד מהרשימה.
- **פרויקט חדש בתיק העבודות:** שמים צילום מסך ב-`src/assets/work`, ומוסיפים שורה ב-`src/data/projects.ts` עם שם הקובץ. התמונה מוקטנת ומומרת לבד בזמן הבנייה. כשיש פרויקט אחד לפחות, הקרוסלה מתחלפת ברשימה.
- **סקשן בדף הבית:** הרכיב שלו ב-`src/components`, הסדר ב-`src/pages/index.astro`, והשם בתפריט ובפוטר ב-`src/data/nav.ts`.
- **שם האתר:** `src/data/site.ts`.

## בלוג

העמוד `/blog/` מציג את כל המדריכים, וכל מדריך מקבל עמוד משלו.

מדריך חדש: מעתיקים את `src/content/guides/_תבנית.md` לקובץ חדש באותה תיקייה, עם שם באנגלית (השם הופך לכתובת, למשל `claude-code-setup.md` ← `/blog/claude-code-setup/`), וממלאים. בתבנית מוסבר גם איך מוסיפים סרטון.

- `draft: true` — המדריך נראה רק ב־`npm run dev`, לא באתר החי. כשהוא מוכן מוחקים את השורה.
- קבצים שמתחילים ב־`_` לא מוצגים.
- מפת האתר (`sitemap.xml`) נבנית לבד ומוסיפה כל מדריך שפורסם.

## בדיקות

- `npm run check` — בדיקת טיפוסים וקוד. רצה גם בכל העלאה ל-GitHub, ושגיאה עוצרת את ההעלאה.
- `npm run test:browser` — בדיקות הדפדפן מ-`tests/redesign-checks.js` (החלון, החבל, הסקשנים, הטופס). צריך שרת פיתוח רץ (`npm run dev`), ופעם ראשונה גם `npx playwright install chromium`.

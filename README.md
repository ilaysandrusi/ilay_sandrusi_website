# בניית אתרים · איליי סנדרוסי

אתר עסקי בעברית מלאה (RTL) לעסק בניית האתרים של איליי סנדרוסי. נבנה עם [Astro](https://astro.build) כאתר סטטי — מהיר, ללא JavaScript מיותר, ומוכן לפריסה בכל שירות אחסון סטטי (Vercel, Netlify, Cloudflare Pages).

## הרצה מקומית

```sh
npm install
npm run dev        # שרת פיתוח בכתובת http://localhost:4321
npm run build      # בניית גרסת פרודקשן לתיקיית dist/
npm run preview    # תצוגה מקדימה של גרסת הפרודקשן
```

## מבנה הפרויקט

```text
src/
├── layouts/Layout.astro      # תבנית בסיס: RTL, פונטים, מטא־תגיות
├── styles/global.css         # משתני עיצוב וסגנונות גלובליים
├── components/               # סקשנים של העמוד
│   ├── Header.astro          # ניווט עליון + תפריט מובייל
│   ├── Hero.astro            # פתיח ראשי
│   ├── Services.astro        # שירותים
│   ├── Process.astro         # תהליך העבודה
│   ├── Work.astro            # תיק עבודות (placeholders)
│   ├── WhyMe.astro           # יתרונות
│   ├── Faq.astro             # שאלות נפוצות
│   ├── Contact.astro         # יצירת קשר
│   └── Footer.astro
└── pages/index.astro         # עמוד הבית
```

## מה נשאר להשלים לפני עלייה לאוויר

- [ ] **פרטי קשר אמיתיים** ב-`src/components/Contact.astro` — טלפון, מייל וקישור וואטסאפ (כרגע placeholders).
- [ ] **תיק עבודות** ב-`src/components/Work.astro` — להחליף את כרטיסי הדוגמה בצילומי מסך וקישורים לפרויקטים אמיתיים.
- [ ] **דומיין ופריסה** — חיבור דומיין והעלאה לשירות אחסון.
- [ ] אופציונלי: לוגו, תמונת פרופיל, והמלצות מלקוחות אמיתיים.

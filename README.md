# בניית אתרים · איליי סנדרוסי

אתר עסקי בעברית (RTL), mobile-first. נבנה ב-[Astro](https://astro.build) כאתר סטטי ונפרס ל-GitHub Pages.

**לייב:** https://ilaysandrusi.github.io/ilay_sandrusi_website/

## הרצה מקומית

```sh
npm install
npm run dev
npm run build
npm run preview
```

## מבנה

```text
src/
├── data/contact.ts           # טלפון / וואטסאפ / מייל — לעדכן כאן
├── layouts/Layout.astro
├── styles/global.css
├── components/
│   ├── Header.astro
│   ├── Hero.astro
│   ├── Services.astro
│   ├── Packages.astro        # 4 מסלולים
│   ├── Process.astro
│   ├── WhyMe.astro
│   ├── Faq.astro
│   ├── Contact.astro
│   ├── Footer.astro
│   └── MobileBar.astro       # סרגל וואטסאפ/טלפון בנייד
└── pages/index.astro
```

פריסה אוטומטית: כל push ל-`main` מריץ `.github/workflows/deploy.yml`.

## לפני לקוחות אמיתיים

עדכנו ב-`src/data/contact.ts` את הטלפון, קישור הוואטסאפ והמייל (כרגע placeholders).

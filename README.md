# בניית אתרים · איליי סנדרוסי

אתר עסקי בעברית (RTL), חוויית סצנות + בחירה אינטראקטיבית. נבנה ב-Astro ונפרס ל-GitHub Pages.

**לייב:** https://ilaysandrusi.github.io/ilay_sandrusi_website/

## מבנה

```text
src/
├── data/contact.ts
├── layouts/Layout.astro
├── styles/global.css
├── components/
│   ├── Header.astro
│   ├── SceneOpen.astro      # פתיח מלא־מסך
│   ├── SceneChoose.astro    # בחירה אינטראקטיבית
│   ├── ScenePlans.astro     # מסלולים + WhatsApp
│   ├── SceneAbout.astro     # רקע אישי
│   ├── Footer.astro
│   └── MobileBar.astro
└── pages/index.astro
```

עדכון פרטי קשר: `src/data/contact.ts`

## בלוג

העמוד `/blog/` מציג את כל המדריכים, וכל מדריך מקבל עמוד משלו.

מדריך חדש: מעתיקים את `src/content/guides/_תבנית.md` לקובץ חדש באותה תיקייה, עם שם באנגלית (השם הופך לכתובת, למשל `claude-code-setup.md` ← `/blog/claude-code-setup/`), וממלאים.

- `draft: true` — המדריך נראה רק ב־`npm run dev`, לא באתר החי. כשהוא מוכן מוחקים את השורה.
- קבצים שמתחילים ב־`_` לא מוצגים.
- מפת האתר (`sitemap.xml`) נבנית לבד ומוסיפה כל מדריך שפורסם.

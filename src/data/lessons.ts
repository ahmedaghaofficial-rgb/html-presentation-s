/**
 * فهرس دروس الكورس — مصدر واحد للحقيقة.
 * بيستخدمه: src/pages/index.astro (القايمة) و Deck.astro (زرار كل الدروس + سهم قبل/بعد).
 * لو ضفت درس، ضيفه هنا وبس.
 */
export interface LessonRef {
  n: string;        // رقم الدرس بالعربي
  t: string;        // اسمه
  m: string;        // المدة
  href: string | null;   // null = لسه متعملش
  unit: string;     // الفصل
}

export const LESSONS: LessonRef[] = [
  { n: '١', t: 'خلي الـAI يفهمك من أول مرة — الطبقات التلاتة', m: '~١٢ د', href: '/lesson-01', unit: 'الأساس' },
  { n: '٢', t: 'درس تاني (نموذج فاضي)', m: '—', href: null, unit: 'الأساس' },
];

/** الدروس الجاهزة بس — للتنقل قبل/بعد */
export const READY = LESSONS.filter((l) => l.href);

/** الدرس اللي قبل واللي بعد الحالي (من الجاهزين) */
export function neighbours(pathname: string) {
  const clean = pathname.replace(/\.html$/, '').replace(/\/$/, '');
  const i = READY.findIndex((l) => l.href === clean);
  return { prev: i > 0 ? READY[i - 1] : null, next: i >= 0 && i < READY.length - 1 ? READY[i + 1] : null, current: i >= 0 ? READY[i] : null };
}

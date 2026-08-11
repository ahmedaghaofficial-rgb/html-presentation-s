/**
 * viz.ts — الأساسات المشتركة لكل رسمة canvas في الديك.
 * أي viz جديد المفروض يبقى ~٤٠ سطر: fit() + loop() + الرسم — مش boilerplate.
 *
 * import { fit, loop, CL, rr, marker, fig, arrow, txt, wrap, pill, board, at, ease, lerp } from '@lib/viz';
 */

export type Pt = [number, number];
export type Ctx = CanvasRenderingContext2D;

/** لوحة ألوان البراند — استخدمها بدل أي hex في الرسم */
export const CL = {
  indigo: '#6366f1',
  violet: '#a855f7',
  pink: '#ec4899',
  cyan: '#67e8f9',
  green: '#34d399',
  amber: '#fbbf24',
  red: '#f87171',
  chalk: '#eef0ff',
  txt: '#f0eeff',
  dim: '#8a8aa3',
  mute: '#5c5c72',
  bg: '#07070d',
  board: '#0a0a13',
} as const;

/**
 * آخر كانفس اتعمله fit — بيستخدمه loop() عشان يعرف الرسمة دي في أنهي سلايد.
 * (كل viz بينده fit() وبعدها loop() على طول في نفس الملف، فالربط مضمون.)
 */
let lastFitted: HTMLCanvasElement | null = null;

/** DPR scaling + ResizeObserver على الأب. بترجع كائن حالة {ctx, W, H} بيتحدّث لوحده. */
export function fit(canvas: HTMLCanvasElement, onResize?: () => void) {
  const ctx = canvas.getContext('2d')!;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const s = { ctx, W: 0, H: 0, DPR };
  const parent = canvas.parentElement!;
  function resize() {
    s.W = parent.clientWidth;
    s.H = parent.clientHeight;
    canvas.width = s.W * DPR;
    canvas.height = s.H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    onResize?.();
  }
  resize();
  new ResizeObserver(resize).observe(parent);
  // تأمين: الـResizeObserver مش بيتنفّذ لو الصفحة موقوفة عن الرسم (تاب مخفي مثلًا)،
  // فلو المقاس اتغيّر وهي مخفية بيفضل الكانفس بالمقاس القديم = صورة مقطوعة.
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) resize(); });
  lastFitted = canvas;
  return s;
}

/**
 * rAF loop مربوط بالسلايد اللي الرسمة جوّاها:
 * · الفريم مبيمشيش غير لما السلايد تبقى ظاهرة (active)
 * · وأول ما تدخل السلايد بيرجع لفريم ٠ — فالرسمة بتتبني قدام المتفرج وانت بتشرح،
 *   مش بتلاقيها خلصت من غير ما يشوفها. ولو رجعت للسلايد تاني بتتعاد من الأول.
 */
export function loop(draw: (frame: number) => void) {
  const el = lastFitted; lastFitted = null;
  const slide = el?.closest?.('.slide') as HTMLElement | null;
  let frame = 0;
  let wasOn = slide ? slide.classList.contains('active') : true;

  const tick = () => {
    const on = slide ? slide.classList.contains('active') : true;
    if (on && !wasOn) frame = 0;          // دخلنا السلايد = ابدأ من الأول
    wasOn = on;
    if (on) { frame++; draw(frame); }
    requestAnimationFrame(tick);
  };
  tick();
}

/* ─── math ─── */
/** نسبة تقدّم من فريم a لفريم b، مقصوصة بين ٠ و١ */
export const at = (f: number, a: number, b: number) => Math.min(1, Math.max(0, (f - a) / (b - a)));
export const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** نبضة ٠..١ */
export const pulse = (frame: number, k = 0.05, ph = 0) => 0.5 + 0.5 * Math.sin(frame * k + ph);
/** أرقام عربية-هندية */
export const ar = (n: number | string) => String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

/* ─── shapes ─── */
export function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** كارت مدوّر بحدود ووهج اختياري */
export function card(ctx: Ctx, x: number, y: number, w: number, h: number, o: {
  fill?: string; stroke?: string; lw?: number; r?: number; glow?: number;
} = {}) {
  const { fill = 'rgba(20,20,30,0.94)', stroke = 'rgba(255,255,255,0.09)', lw = 1.2, r = 14, glow = 0 } = o;
  ctx.save();
  if (glow > 0) { ctx.shadowColor = stroke; ctx.shadowBlur = 24 * glow; }
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = fill; ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke();
  ctx.restore();
}

/**
 * marker — بيرسم مصفوفة نقط كخط ماركر لحد نسبة prog (٠..١).
 * ده قلب أسلوب «السبورة»: الحاجة بتتُرسم بالتدريج مش بتظهر جاهزة.
 */
export function marker(ctx: Ctx, pts: Pt[], prog: number, col: string, lw = 2.4) {
  if (prog <= 0 || pts.length < 2) return;
  let total = 0; const seg: number[] = [];
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(d); total += d;
  }
  const target = total * prog;
  ctx.save();
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.shadowColor = col; ctx.shadowBlur = 6;
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = seg[i - 1];
    if (acc + d <= target) { ctx.lineTo(pts[i][0], pts[i][1]); acc += d; }
    else {
      const rem = (target - acc) / d;
      ctx.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * rem,
                 pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * rem);
      break;
    }
  }
  ctx.stroke(); ctx.restore();
}

/** نقط قوس بيزيه — للأقواس والأسهم المنحنية اللي بتتُرسم بالماركر */
export function bezierPts(a: Pt, ctrl: Pt, b: Pt, n = 24): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u * u * a[0] + 2 * u * t * ctrl[0] + t * t * b[0],
              u * u * a[1] + 2 * u * t * ctrl[1] + t * t * b[1]]);
  }
  return out;
}

/** شخص بسيط (راس + جسم + إيدين + رجلين) — الوحدة القياسية للناس في الرسومات */
export function fig(ctx: Ctx, x: number, y: number, s: number, col: string, a = 1, glow = 0) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = Math.min(1, a);
  if (glow > 0) { ctx.shadowColor = col; ctx.shadowBlur = 18 * glow; }
  ctx.strokeStyle = col; ctx.lineWidth = 2.2 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y - 21 * s, 5.8 * s, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y - 15 * s); ctx.lineTo(x, y - 5.5 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 6.5 * s, y - 11.5 * s); ctx.lineTo(x + 6.5 * s, y - 11.5 * s); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - 5.5 * s); ctx.lineTo(x - 5 * s, y);
  ctx.moveTo(x, y - 5.5 * s); ctx.lineTo(x + 5 * s, y);
  ctx.stroke(); ctx.restore();
}

/** سهم مستقيم برأس */
export function arrow(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, col: string, o: {
  a?: number; lw?: number; head?: number; dash?: number[];
} = {}) {
  const { a = 1, lw = 2, head = 8, dash } = o;
  ctx.save(); ctx.globalAlpha = a;
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.shadowColor = col; ctx.shadowBlur = 8;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.setLineDash([]);
  const ang = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2 - head * Math.cos(ang - 0.5), y2 - head * Math.sin(ang - 0.5));
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(ang + 0.5), y2 - head * Math.sin(ang + 0.5));
  ctx.stroke(); ctx.restore();
}

/** علامة ✕ (للمقارنات الغلط والمستبعد) */
export function cross(ctx: Ctx, x: number, y: number, r: number, col: string, a = 1, lw = 2.6) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r);
  ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r);
  ctx.stroke(); ctx.restore();
}

/* ─── text ─── */
export function txt(ctx: Ctx, s: string, x: number, y: number, o: {
  size?: number; col?: string; weight?: number; align?: CanvasTextAlign; a?: number; font?: 'cairo' | 'marker';
} = {}) {
  const { size = 13, col = CL.txt, weight = 800, align = 'center', a = 1, font = 'cairo' } = o;
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = `${weight} ${size}px ${font === 'marker' ? 'Lemonada, Cairo' : 'Cairo'}, sans-serif`;
  ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
  ctx.restore();
}

/** نص بيتلف على أكتر من سطر — بيرجع عدد السطور */
export function wrap(ctx: Ctx, s: string, x: number, y: number, maxW: number, o: Parameters<typeof txt>[4] & { lh?: number } = {}) {
  const size = o.size ?? 13, lh = o.lh ?? size + 7;
  ctx.save();
  ctx.font = `${o.weight ?? 700} ${size}px ${o.font === 'marker' ? 'Lemonada, Cairo' : 'Cairo'}, sans-serif`;
  const words = s.split(' '); const lines: string[] = []; let ln = '';
  for (const w of words) {
    const t = ln ? ln + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && ln) { lines.push(ln); ln = w; } else ln = t;
  }
  if (ln) lines.push(ln);
  ctx.restore();
  const y0 = y - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => txt(ctx, l, x, y0 + i * lh, o));
  return lines.length;
}

/** بادج/pill بنص جواه */
export function pill(ctx: Ctx, s: string, cx: number, cy: number, o: {
  col?: string; fill?: string; size?: number; padX?: number; h?: number; a?: number; glow?: number;
} = {}) {
  const { col = CL.cyan, fill = 'rgba(12,12,20,0.92)', size = 12, padX = 18, h = 26, a = 1, glow = 0 } = o;
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = `800 ${size}px Cairo, sans-serif`;
  const w = ctx.measureText(s).width + padX * 2;
  if (glow > 0) { ctx.shadowColor = col; ctx.shadowBlur = 12 * glow; }
  rr(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fillStyle = fill; ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(s, cx, cy + 1);
  ctx.restore();
  return w;
}

/**
 * board — سطح السبورة: خلفية غامقة + شبكة نقط + إطار بجراديينت البراند بيتنفّس.
 * بترجع صندوق الرسم الداخلي {x,y,w,h} عشان ترسم جواه.
 */
export function board(ctx: Ctx, W: number, H: number, o: { title?: string; frame?: number; pad?: number } = {}) {
  const pad = o.pad ?? 6;
  const bx = pad, by = pad, bw = W - pad * 2, bh = H - pad * 2;

  rr(ctx, bx, by, bw, bh, 16);
  ctx.fillStyle = CL.board; ctx.fill();

  ctx.save(); rr(ctx, bx, by, bw, bh, 16); ctx.clip();
  ctx.fillStyle = 'rgba(168,85,247,0.055)';
  for (let gx = bx + 22; gx < bx + bw; gx += 26)
    for (let gy = by + 22; gy < by + bh; gy += 26) { ctx.beginPath(); ctx.arc(gx, gy, 1, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();

  const breath = 10 + 5 * Math.sin((o.frame ?? 0) * 0.03);
  const g = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
  g.addColorStop(0, CL.indigo); g.addColorStop(0.5, CL.violet); g.addColorStop(1, CL.pink);
  ctx.save();
  ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.shadowColor = CL.violet; ctx.shadowBlur = breath;
  rr(ctx, bx, by, bw, bh, 16); ctx.stroke(); ctx.restore();

  if (o.title) {
    txt(ctx, o.title, bx + bw - 22, by + 30, { size: 17, col: CL.chalk, weight: 800, align: 'right', font: 'marker' });
  }
  return { x: bx, y: by, w: bw, h: bh };
}

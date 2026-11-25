import type { RiskIndicator } from "./types";

type Rule = {
  id: string;
  title: string;
  weight: number;
  patterns: RegExp[];
  explanation: string;
  recommendation: string;
  negate?: RegExp;
};

const RULES: Rule[] = [
  {
    id: "urgency", title: "Давление срочностью", weight: 2,
    patterns: [/срочн\w*/iu, /немедленн\w*/iu, /в течение (?:часа|\d+ минут)/iu, /до конца (?:дня|часа)/iu, /urgent(?:ly)?\b/iu, /immediately\b/iu],
    explanation: "Срочность сокращает время на независимую проверку и часто используется в социальной инженерии.",
    recommendation: "Остановитесь и проверьте запрос по известному каналу, даже если указан короткий срок."
  },
  {
    id: "bank-details", title: "Изменение платёжных реквизитов", weight: 5,
    patterns: [/(?:смен|измен|нов)\w*.{0,35}(?:реквизит|сч[её]т|iban|бик)/iu, /(?:реквизит|сч[её]т|iban).{0,35}(?:смен|измен|нов)\w*/iu, /updated bank details/iu],
    explanation: "Подмена реквизитов — типичный сценарий мошенничества с деловой перепиской (BEC).",
    recommendation: "Подтвердите новые реквизиты по ранее известному номеру контрагента, не из этого письма.",
    negate: /не (?:меня(?:ли|ем)|изменя(?:ли|ем)).{0,40}реквизит/iu
  },
  {
    id: "money-transfer", title: "Требование перевести деньги", weight: 5,
    patterns: [/(?:перевед|оплат|перечисл|отправ)\w*.{0,30}(?:деньг|сумм|рубл|₽|плат[её]ж|сч[её]т)/iu, /(?:сделайте|проведите).{0,20}(?:перевод|плат[её]ж)/iu, /wire (?:the )?(?:money|funds)/iu],
    explanation: "Финансовое действие по одному письму нельзя считать подтверждённым распоряжением.",
    recommendation: "Не проводите платёж до независимого подтверждения личности отправителя и назначения платежа.",
    negate: /не (?:переводите|оплачивайте|перечисляйте|отправляйте).{0,45}(?:деньг|сумм|сч[её]т|реквизит)/iu
  },
  {
    id: "credentials", title: "Запрос секрета или данных доступа", weight: 6,
    patterns: [/(?:пришл|сообщ|переда|введ)[а-яёa-z]*.{0,35}(?:парол|код[а-яёa-z]* подтвержд|одноразов[а-яёa-z]* код|otp|данн[а-яёa-z]*(?:\s+для)?\s+вход)/iu, /(?:password|verification code|one[- ]time code|otp).{0,25}(?:send|share|reply|enter)/iu],
    explanation: "Пароли и одноразовые коды позволяют войти в аккаунт от имени сотрудника.",
    recommendation: "Никому не сообщайте пароль или код подтверждения; обратитесь в ИБ или поддержку по известному адресу.",
    negate: /(?:не (?:сообщайте|передавайте|отправляйте).{0,50}(?:парол|код)|если кто-то.{0,80}(?:парол|код))/iu
  },
  {
    id: "no-verification", title: "Запрет независимой проверки", weight: 5,
    patterns: [/(?:не (?:звоните|уточняйте|проверяйте|сообщайте)|без (?:звонк|согласован)|между нами|конфиденциально).{0,35}(?:руковод|директор|коллег|контрагент|кому-либо)?/iu, /do not (?:call|verify|tell|contact)/iu],
    explanation: "Запрет сверить запрос изолирует сотрудника и мешает обнаружить подмену отправителя.",
    recommendation: "Не соблюдайте запрет на проверку: свяжитесь с предполагаемым автором другим способом."
  },
  {
    id: "authority", title: "Давление авторитетом", weight: 3,
    patterns: [/(?:я|это).{0,12}(?:директор|генеральн\w* директор|руководитель|финансов\w* директор)/iu, /(?:по поручению|распоряжение).{0,25}(?:директор|руководител|генеральн)/iu, /(?:служба безопасности|налоговая|банк).{0,40}(?:требует|предупреждает|заблокир)/iu, /(?:ceo|director|security team).{0,30}(?:request|order|require)/iu],
    explanation: "Упоминание руководителя или известной организации может подавлять сомнения, но не подтверждает личность.",
    recommendation: "Подтвердите запрос через корпоративный справочник или известный контакт организации."
  },
  {
    id: "suspicious-link", title: "Ссылка в тексте письма", weight: 3,
    patterns: [/https?:\/\/[^\s<>"']+/iu, /\bwww\.[^\s<>"']+/iu, /\b[a-z0-9-]+\.(?:com|net|org|ru|рф)\/[\w?=&%./-]+/iu],
    explanation: "Ссылка может вести на поддельную страницу. По тексту нельзя подтвердить её назначение.",
    recommendation: "Не открывайте ссылку; перейдите на нужный сервис вручную через известный адрес или закладку."
  },
  {
    id: "external-resource", title: "Требование открыть сторонний ресурс", weight: 3,
    patterns: [/(?:перейд|открой|нажм|кликн|войд)\w*.{0,35}(?:ссылк|портал|сайт|аккаунт|кабинет)/iu, /(?:click|open|visit|log in|sign in).{0,25}(?:link|portal|website|account)/iu],
    explanation: "Призыв перейти на внешний ресурс может вести к краже учётных данных или загрузке вредоносного содержимого.",
    recommendation: "Откройте официальный сервис самостоятельно, не используя адрес из письма."
  },
  {
    id: "pressure", title: "Угроза или обещание выгоды", weight: 3,
    patterns: [/(?:аккаунт|доступ|сч[её]т).{0,30}(?:заблокир|приостанов|удал)/iu, /(?:штраф|увольнен|санкци|последстви|потеряете)/iu, /(?:вознагражден|преми|выигрыш|бонус).{0,35}(?:получ|гарант)/iu, /(?:account|access).{0,20}(?:blocked|suspended|closed)/iu],
    explanation: "Страх потери или обещание выгоды подталкивают действовать без обычной проверки.",
    recommendation: "Не действуйте под давлением; проверьте ситуацию через официальный канал."
  }
];

function sentenceAround(text: string, index: number, length: number): string {
  const startBreak = Math.max(text.lastIndexOf("\n", index), text.lastIndexOf(".", index - 1));
  const nextNewline = text.indexOf("\n", index + length);
  const nextDot = text.indexOf(".", index + length);
  const candidates = [nextNewline, nextDot].filter((value) => value >= 0);
  const end = candidates.length ? Math.min(...candidates) + 1 : Math.min(text.length, index + length + 100);
  const start = Math.max(0, startBreak + 1);
  const evidence = text.slice(start, end).trim();
  return evidence.length <= 300 ? evidence : `${evidence.slice(0, 297).trimEnd()}…`;
}

export function detectIndicators(text: string): RiskIndicator[] {
  const normalized = text.replace(/\s+/gu, " ").trim();
  const found: RiskIndicator[] = [];

  for (const rule of RULES) {
    if (rule.negate?.test(normalized)) continue;
    const matches = rule.patterns.map((pattern) => pattern.exec(text)).filter((match): match is RegExpExecArray => match !== null);
    if (!matches.length) continue;
    const first = matches.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))[0];
    found.push({
      id: rule.id,
      title: rule.title,
      evidence: sentenceAround(text, first.index ?? 0, first[0].length),
      explanation: rule.explanation,
      recommendation: rule.recommendation,
      weight: rule.weight
    });
  }
  return found;
}

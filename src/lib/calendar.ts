// Helpers para "Adicionar ao Calendário" — sem dependências externas.
// Datas internas chegam no formato "YYYY-MM-DD" e "HH:MM" (hora local de São Paulo).

export const DURACAO_HORAS = 4;
const TZID = "America/Sao_Paulo";

export interface CalendarEvent {
  titulo: string;
  descricao: string;
  local: string;
  data: string;   // "YYYY-MM-DD"
  hora?: string;  // "HH:MM" — vazio = all-day
}

function parseDate(d: string): { y: number; m: number; d: number } {
  const [y, m, dd] = d.split("-").map(Number);
  return { y, m, d: dd };
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

// Soma horas a uma data local (sem conversão UTC) e devolve componentes.
function addHoursLocal(
  date: string,
  time: string,
  hours: number
): { y: number; m: number; d: number; hh: number; mm: number } {
  const { y, m, d } = parseDate(date);
  const [hh, mm] = time.split(":").map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  dt.setHours(dt.getHours() + hours);
  return {
    y: dt.getFullYear(),
    m: dt.getMonth() + 1,
    d: dt.getDate(),
    hh: dt.getHours(),
    mm: dt.getMinutes(),
  };
}

// "YYYYMMDDTHHMMSS" (horário local, sem Z) — usado pelo Google.
function fmtLocalCompact(y: number, m: number, d: number, hh: number, mm: number): string {
  return `${y}${pad(m)}${pad(d)}T${pad(hh)}${pad(mm)}00`;
}

// "YYYY-MM-DDTHH:MM:SS" ISO local (sem Z) — usado pelo Outlook.
function fmtIsoLocal(y: number, m: number, d: number, hh: number, mm: number): string {
  return `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}:00`;
}

// "YYYYMMDD" — para all-day.
function fmtDateCompact(y: number, m: number, d: number): string {
  return `${y}${pad(m)}${pad(d)}`;
}

// All-day: data final é o dia seguinte (exclusivo).
function nextDayCompact(date: string): string {
  const { y, m, d } = parseDate(date);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + 1);
  return fmtDateCompact(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}

export function googleCalendarUrl(ev: CalendarEvent): string {
  const { titulo, descricao, local, data, hora } = ev;
  let dates: string;
  if (!hora) {
    const { y, m, d } = parseDate(data);
    dates = `${fmtDateCompact(y, m, d)}/${nextDayCompact(data)}`;
  } else {
    const [hh, mm] = hora.split(":").map(Number);
    const { y, m, d } = parseDate(data);
    const end = addHoursLocal(data, hora, DURACAO_HORAS);
    dates = `${fmtLocalCompact(y, m, d, hh, mm)}/${fmtLocalCompact(
      end.y, end.m, end.d, end.hh, end.mm
    )}`;
  }
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: titulo,
    dates,
    details: descricao,
    location: local,
    ctz: TZID,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookUrl(ev: CalendarEvent): string {
  const { titulo, descricao, local, data, hora } = ev;
  let startdt: string;
  let enddt: string;
  let allday: boolean;
  if (!hora) {
    allday = true;
    const { y, m, d } = parseDate(data);
    startdt = `${y}-${pad(m)}-${pad(d)}`;
    const nxt = nextDayCompact(data);
    enddt = `${nxt.slice(0, 4)}-${nxt.slice(4, 6)}-${nxt.slice(6, 8)}`;
  } else {
    allday = false;
    const [hh, mm] = hora.split(":").map(Number);
    const { y, m, d } = parseDate(data);
    const end = addHoursLocal(data, hora, DURACAO_HORAS);
    startdt = fmtIsoLocal(y, m, d, hh, mm);
    enddt = fmtIsoLocal(end.y, end.m, end.d, end.hh, end.mm);
  }
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: titulo,
    startdt,
    enddt,
    body: descricao,
    location: local,
    allday: String(allday),
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function escapeIcs(text: string): string {
  return (text || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function dtstampUtc(): string {
  const d = new Date();
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

export function buildIcs(ev: CalendarEvent, uid: string): string {
  const { titulo, descricao, local, data, hora } = ev;
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TicketHub//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstampUtc()}`,
  ];
  if (!hora) {
    const { y, m, d } = parseDate(data);
    lines.push(`DTSTART;VALUE=DATE:${fmtDateCompact(y, m, d)}`);
    lines.push(`DTEND;VALUE=DATE:${nextDayCompact(data)}`);
  } else {
    const [hh, mm] = hora.split(":").map(Number);
    const { y, m, d } = parseDate(data);
    const end = addHoursLocal(data, hora, DURACAO_HORAS);
    lines.push(`DTSTART;TZID=${TZID}:${fmtLocalCompact(y, m, d, hh, mm)}`);
    lines.push(`DTEND;TZID=${TZID}:${fmtLocalCompact(end.y, end.m, end.d, end.hh, end.mm)}`);
  }
  lines.push(`SUMMARY:${escapeIcs(titulo)}`);
  lines.push(`DESCRIPTION:${escapeIcs(descricao)}`);
  lines.push(`LOCATION:${escapeIcs(local)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// "YYYY-MM-DD" -> "DD/MM/AAAA"
export function fmtDataBR(s: string): string {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

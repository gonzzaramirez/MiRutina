import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/es";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.locale("es");
dayjs.extend(relativeTime);

const TIMEZONE = "America/Argentina/Buenos_Aires";

/**
 * Utilidades para manejo de fechas con Day.js
 */

/**
 * Obtiene la fecha actual en la zona horaria configurada
 */
export function today(): dayjs.Dayjs {
  return dayjs().tz(TIMEZONE);
}

/**
 * Convierte un valor de fecha (string, Date o Dayjs) a Dayjs en la zona horaria configurada
 */
export function parseDate(date: string | Date | dayjs.Dayjs): dayjs.Dayjs {
  if (typeof date === "string") {
    return dayjs(date).tz(TIMEZONE);
  }
  if (date instanceof Date) {
    return dayjs(date).tz(TIMEZONE);
  }
  // ya es un objeto dayjs
  return date.tz ? date.tz(TIMEZONE) : dayjs(date).tz(TIMEZONE);
}

/**
 * Formatea una fecha para mostrar en la interfaz de usuario
 */
export function formatForDisplay(date: dayjs.Dayjs | string | Date): string {
  const dayjsDate = parseDate(date);
  return dayjsDate.format("dddd, D [de] MMMM [de] YYYY");
}

/**
 * Formatea una fecha de forma corta para mostrar en la interfaz
 */
export function formatShort(date: dayjs.Dayjs | string | Date): string {
  const dayjsDate = parseDate(date);
  return dayjsDate.format("DD MMM YYYY");
}

/**
 * Formatea una fecha para el input de tipo date (YYYY-MM-DD)
 */
export function formatForInput(date: dayjs.Dayjs | string | Date): string {
  const dayjsDate = parseDate(date);
  return dayjsDate.format("YYYY-MM-DD");
}

/**
 * Convierte una fecha a formato ISO para la base de datos
 */
export function toISOString(date: dayjs.Dayjs | string | Date): string {
  const dayjsDate = parseDate(date);
  return dayjsDate.toISOString();
}

/**
 * Obtiene la fecha de hoy en formato para input
 */
export function todayForInput(): string {
  return formatForInput(today());
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date: dayjs.Dayjs | string | Date): boolean {
  const dayjsDate = parseDate(date);
  return dayjsDate.isSame(today(), "day");
}

/**
 * Verifica si una fecha es ayer
 */
export function isYesterday(date: dayjs.Dayjs | string | Date): boolean {
  const dayjsDate = parseDate(date);
  return dayjsDate.isSame(today().subtract(1, "day"), "day");
}

/**
 * Obtiene una fecha relativa (hoy, ayer, hace X días)
 */
export function getRelativeDate(date: dayjs.Dayjs | string | Date): string {
  const dayjsDate = parseDate(date);

  if (isToday(dayjsDate)) {
    return "Hoy";
  } else if (isYesterday(dayjsDate)) {
    return "Ayer";
  } else {
    return dayjsDate.fromNow();
  }
}

/**
 * Crea un rango de fechas para consultas
 */
export function createDateRange(date: dayjs.Dayjs | string) {
  const dayjsDate = parseDate(date);
  return {
    start: dayjsDate.startOf("day").toISOString(),
    end: dayjsDate.endOf("day").toISOString(),
  };
}

/**
 * Valida si una fecha es válida
 */
export function isValidDate(date: string): boolean {
  return dayjs(date).isValid();
}

/**
 * Devuelve el nombre corto del mes en español (p. ej. "ene", "feb")
 */
export function formatMonthShort(date: dayjs.Dayjs | string | Date): string {
  const dayjsDate = parseDate(date);
  return dayjsDate.format("MMM");
}

/**
 * Clase DateUtils para compatibilidad con código existente
 * @deprecated Usar las funciones exportadas directamente
 */
export class DateUtils {
  static today = today;
  static parseDate = parseDate;
  static formatForDisplay = formatForDisplay;
  static formatShort = formatShort;
  static formatForInput = formatForInput;
  static toISOString = toISOString;
  static todayForInput = todayForInput;
  static isToday = isToday;
  static isYesterday = isYesterday;
  static getRelativeDate = getRelativeDate;
  static createDateRange = createDateRange;
  static isValidDate = isValidDate;
  static formatMonthShort = formatMonthShort;
}

export default DateUtils;

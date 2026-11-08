export interface WeekDay {
  dateString: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue, etc.
  fullDayName: string; // Monday, Tuesday, etc.
  dayNumber: string; // 09, 10, etc.
  isToday: boolean;
  dateObj: Date;
}

export class DateHelper {
  /**
   * Returns YYYY-MM-DD string for a given Date in local time.
   */
  static toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Formats a date string (YYYY-MM-DD) into readable format like "Friday, 14 January"
   */
  static formatDisplayDate(dateStr: string): string {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  /**
   * Returns start (Monday 00:00:00) and end (Sunday 23:59:59) of the current week.
   */
  static getCurrentWeekRange(referenceDate: Date = new Date()) {
    const d = new Date(referenceDate);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    const diff = day === 0 ? -6 : 1 - day; // Monday offset

    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { monday, sunday };
  }

  /**
   * Returns an array of the 7 days of the current week (Monday to Sunday).
   */
  static getCurrentWeekDays(referenceDate: Date = new Date()): WeekDay[] {
    const { monday } = this.getCurrentWeekRange(referenceDate);
    const todayStr = this.toDateString(referenceDate);

    const dayShortNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayFullNames = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const weekDays: WeekDay[] = [];

    for (let i = 0; i < 7; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);

      const dateString = this.toDateString(current);
      const dayNumber = String(current.getDate()).padStart(2, "0");

      weekDays.push({
        dateString,
        dayName: dayShortNames[i],
        fullDayName: dayFullNames[i],
        dayNumber,
        isToday: dateString === todayStr,
        dateObj: current,
      });
    }

    return weekDays;
  }
}

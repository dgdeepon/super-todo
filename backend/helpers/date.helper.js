class DateHelper {
  static getThisWeekStartAndEndDate() {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const parts = formatter.formatToParts(now);

    const getPart = (type) =>
      Number(parts.find((part) => part.type === type).value);

    const year = getPart("year");
    const month = getPart("month");
    const date = getPart("day");

    // Represent Indian calendar date as UTC calendar components
    const currentDate = new Date(Date.UTC(year, month - 1, date));

    const day = currentDate.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;

    const firstDayOfWeek = new Date(currentDate);
    firstDayOfWeek.setUTCDate(currentDate.getUTCDate() + diff);

    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setUTCDate(firstDayOfWeek.getUTCDate() + 6);

    // Convert IST midnight boundaries to actual UTC timestamps
    return {
      firstDayOfWeek: new Date(firstDayOfWeek.getTime() - 330 * 60 * 1000),
      lastDayOfWeek: new Date(
        lastDayOfWeek.getTime() + 86400000 - 330 * 60 * 1000 - 1,
      ),
    };
  }
}

module.exports = DateHelper;

class DateHelper {
  static getThisWeekStartAndEndDate() {
    const currentDate = new Date();

    const day = currentDate.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    const firstDayOfWeek = new Date(currentDate);
    firstDayOfWeek.setDate(currentDate.getDate() + diff);
    firstDayOfWeek.setHours(0, 0, 0, 0);

    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);

    return { firstDayOfWeek, lastDayOfWeek };
  }
}

module.exports = DateHelper;

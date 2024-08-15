/**
 * Converts a UTC timestamp to the user's local timezone readable date and time.
 *
 * @param {number} utcTimestamp - The UTC timestamp to convert e.g., 2024-08-15T14:27:58.351Z
 * @returns {string} The formatted date and time in the user's local timezone e.g., 17:27 on Aug 15, '24
 */
function convertToUserTimezone(utcTimestamp) {
  const date = new Date(utcTimestamp),
    months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];

  // format the date in accordance with the user's local timezone
  const year = date.getFullYear(),
    month = months[date.getMonth()],
    day = date.getDate(),
    hours = String(date.getHours()).padStart(2, "0"),
    minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes} on ${month} ${day}, '${year % 2000}`;
}

// Example usage -- uncomment to run
// const utcTimestamp = "2024-08-15T14:27:58.351Z";
// console.log(convertToUserTimezone(utcTimestamp));

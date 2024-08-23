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
    time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });

  return `${time} on ${month} ${day}, '${year % 2000}`;
}

// Example usage -- uncomment to run
// const utcTimestamp = "2024-08-15T14:27:58.351Z";
// console.log(convertToUserTimezone(utcTimestamp));

export { convertToUserTimezone };

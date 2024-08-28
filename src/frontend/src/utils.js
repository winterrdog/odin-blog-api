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

// add a function that shows the time past since the timestamp based on the user's local timezone
function timeSince(utcTimestamp) {
  const date = new Date(utcTimestamp),
    currentDate = new Date(),
    timeDiff = currentDate - date;

  // calculate the time difference in seconds, minutes, hours, and days
  const timeDiffInSeconds = timeDiff / 1_000,
    timeDiffInMinutes = timeDiff / 60_000,
    timeDiffInHours = timeDiff / 3_600_000,
    timeDiffInDays = timeDiff / 86_400_000,
    timeDiffInWeeks = timeDiff / 604_800_000,
    timeDiffInMonths = timeDiff / 2_592_000_000,
    timeDiffInYears = timeDiff / 31_536_000_000;

  const seconds = Math.floor(timeDiffInSeconds),
    minutes = Math.floor(timeDiffInMinutes),
    hours = Math.floor(timeDiffInHours),
    days = Math.floor(timeDiffInDays),
    weeks = Math.floor(timeDiffInWeeks),
    months = Math.floor(timeDiffInMonths),
    years = Math.floor(timeDiffInYears);

  const parseSeconds = function (seconds) {
    let result = "";

    if (seconds === 30) {
      result = "about half a minute ago";
    } else if (seconds === 1) {
      result = "about a second ago";
    } else if (seconds < 1) {
      result = "just now";
    } else {
      result = `about ${seconds} seconds ago`;
    }

    return result;
  };

  const parseMinutes = function (minutes) {
    let result = "";

    // if time difference is exactly 30 minutes, set to "half an hour ago"
    if (minutes === 30) {
      result = "half an hour ago";
    } else {
      const plural = minutes > 1 ? "s" : "";
      result = `${minutes} minute${plural} ago`;
    }

    return result;
  };

  const parseHours = function (hours) {
    let result = "";

    // if time difference is exactly 12 hours, set to "half a day ago"
    if (hours === 12) {
      result = "half a day ago";
    } else {
      const plural = hours > 1 ? "s" : "";
      result = `${hours} hour${plural} ago`;
    }

    return result;
  };

  const parseDays = function (days) {
    let result = "";

    // if time difference is more 24 hours, set to yesterday
    if (days === 1) {
      result = "yesterday";
    } else if (days > 1) {
      result = `${days} days ago`;
    }

    return result;
  };

  const parseWeeks = function (weeks) {
    let result = "";

    if (weeks === 1) {
      result = "about a week ago";
    } else if (weeks === 2) {
      result = "about half a month ago";
    } else {
      result = `about ${weeks} weeks ago`;
    }

    return result;
  };

  const parseMonths = function (months) {
    let result = "";

    if (months === 1) {
      result = "almost a month ago";
    } else if (months === 6) {
      result = "almost half a year ago";
    } else {
      result = `almost ${months} months ago`;
    }

    return result;
  };

  const parseYears = function (years) {
    let result = "";

    if (years === 1) {
      result = "almost a year ago";
    } else if (years === 5) {
      result = "almost half a decade ago";
    } else if (years === 10) {
      result = "almost a decade ago";
    } else {
      result = `almost ${years} years ago`;
    }

    return result;
  };

  // return the time since the timestamp
  if (seconds < 60) {
    return parseSeconds(seconds);
  }
  if (minutes < 60) {
    return parseMinutes(minutes);
  }
  if (hours < 24) {
    return parseHours(hours);
  }
  if (days < 7) {
    return parseDays(days);
  }
  if (weeks < 4) {
    return parseWeeks(weeks);
  }
  if (months < 12) {
    return parseMonths(months);
  }
  if (years >= 1) {
    return parseYears(years);
  }
}

// Example usage -- uncomment to run
// const utcTimestamp = "2024-07-16T09:00:00.000Z";
// console.log(convertToUserTimezone(utcTimestamp));
// console.log(timeSince(utcTimestamp));

export { convertToUserTimezone, timeSince };

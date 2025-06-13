import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const time = {
  // Get user's selected timezone or browser timezone
  getUserTimezone: () => {
    return localStorage.getItem('user-timezone') || dayjs.tz.guess();
  },

  // Converts UTC date string to user's timezone string in a standard format
  utcToLocal: (utcDateString, format = 'YYYY-MM-DD HH:mm:ss') => {
    if (!utcDateString) return 'N/A';
    return dayjs.utc(utcDateString).tz(time.getUserTimezone()).format(format);
  },

  // Converts local date string/object to UTC date string in a standard format
  localToUtc: (localDate, format = 'YYYY-MM-DDTHH:mm:ss[Z]') => {
    if (!localDate) return null;
    return dayjs.tz(localDate, time.getUserTimezone()).utc().format(format);
  },

  // Gets current local time string in user's timezone
  currentLocal: (format = 'YYYY-MM-DD HH:mm:ss') => {
    return dayjs().tz(time.getUserTimezone()).format(format);
  },

  // Gets current UTC time string
  currentUtc: (format = 'YYYY-MM-DDTHH:mm:ss[Z]') => {
    return dayjs.utc().format(format);
  },
  
  // Formats a date object/string to a specified format in user's timezone
  format: (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    if (!date) return 'N/A';
    return dayjs.tz(date, time.getUserTimezone()).format(format);
  }
};

export default time; 
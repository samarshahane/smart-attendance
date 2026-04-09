// ============================================================
// TIMETABLE UTILITY - Centralized schedule for the system
// ============================================================

const WEEKLY_TIMETABLE = {
  'Monday': [
    { name: 'Cloud Computing', start: '09:00', end: '10:30' },
    { name: 'Artificial Intelligence', start: '11:00', end: '12:30' },
    { name: 'Computer Networks', start: '14:00', end: '15:30' }
  ],
  'Tuesday': [
    { name: 'Operating Systems', start: '09:00', end: '10:30' },
    { name: 'Software Engineering', start: '11:00', end: '12:30' },
    { name: 'Artificial Intelligence', start: '14:00', end: '15:30' }
  ],
  'Wednesday': [
    { name: 'Cloud Computing', start: '09:00', end: '10:30' },
    { name: 'Computer Networks', start: '11:00', end: '12:30' },
    { name: 'Operating Systems', start: '14:00', end: '15:30' }
  ],
  'Thursday': [
    { name: 'Software Engineering', start: '09:00', end: '10:30' },
    { name: 'Artificial Intelligence', start: '11:00', end: '12:30' },
    { name: 'Cloud Computing', start: '14:00', end: '15:30' }
  ],
  'Friday': [
    { name: 'Computer Networks', start: '09:00', end: '10:30' },
    { name: 'Operating Systems', start: '11:00', end: '12:30' },
    { name: 'Software Engineering', start: '14:00', end: '15:30' }
  ],
  'Saturday': [],
  'Sunday': []
};

/**
 * Get the currently ongoing subject based on the time and day.
 * @param {Date} now - Current Date object
 * @returns {Object|null} - The current subject object or null
 */
function getCurrentSubject(now = new Date()) {
  const day = now.toLocaleDateString('en-IN', { weekday: 'long', timeZone: 'Asia/Kolkata' });
  const currentTimeStr = now.toLocaleTimeString('en-IN', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Asia/Kolkata' 
  });

  const todayClasses = WEEKLY_TIMETABLE[day] || [];
  
  return todayClasses.find(cls => {
    return currentTimeStr >= cls.start && currentTimeStr <= cls.end;
  }) || null;
}

module.exports = {
  WEEKLY_TIMETABLE,
  getCurrentSubject
};

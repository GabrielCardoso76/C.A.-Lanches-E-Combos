export type DailySchedule = {
  isOpen: boolean;
  open: string;
  close: string;
};

export type WeeklySchedule = {
  [dayIndex: string]: DailySchedule;
};

const daysOfWeek = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado"
];

function parseTime(timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return { hours, minutes };
}

export function isStoreCurrentlyOpen(schedule: WeeklySchedule): { isOpen: boolean, nextOpenMessage: string } {
  if (!schedule) return { isOpen: true, nextOpenMessage: "" }; // default to open if no schedule

  const now = new Date();
  const currentDayIndex = now.getDay();
  const currentTime = { hours: now.getHours(), minutes: now.getMinutes() };

  // Helper to check if a specific time is within a range
  const isTimeInRange = (time: typeof currentTime, open: typeof currentTime, close: typeof currentTime) => {
    const timeMins = time.hours * 60 + time.minutes;
    const openMins = open.hours * 60 + open.minutes;
    let closeMins = close.hours * 60 + close.minutes;

    // Handle crossing midnight (e.g. 18:00 to 02:00)
    if (closeMins < openMins) {
       if (timeMins >= openMins) return true; // before midnight
       if (timeMins <= closeMins) return true; // after midnight
       return false;
    }

    return timeMins >= openMins && timeMins <= closeMins;
  };

  const todaySchedule = schedule[currentDayIndex.toString()];
  let currentlyOpen = false;

  // First check if open *today* during normal hours or before midnight
  if (todaySchedule && todaySchedule.isOpen) {
    const openTime = parseTime(todaySchedule.open);
    const closeTime = parseTime(todaySchedule.close);
    currentlyOpen = isTimeInRange(currentTime, openTime, closeTime);
  }

  // If not open today, check if open *yesterday* but hours cross midnight and we are still in that window
  if (!currentlyOpen) {
    const yesterdayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
    const yesterdaySchedule = schedule[yesterdayIndex.toString()];
    if (yesterdaySchedule && yesterdaySchedule.isOpen) {
      const openTime = parseTime(yesterdaySchedule.open);
      const closeTime = parseTime(yesterdaySchedule.close);

      const yesterdayCloseMins = closeTime.hours * 60 + closeTime.minutes;
      const yesterdayOpenMins = openTime.hours * 60 + openTime.minutes;

      if (yesterdayCloseMins < yesterdayOpenMins) {
        const timeMins = currentTime.hours * 60 + currentTime.minutes;
        if (timeMins <= yesterdayCloseMins) {
           currentlyOpen = true;
        }
      }
    }
  }

  if (currentlyOpen) {
    return { isOpen: true, nextOpenMessage: "" };
  }

  // If closed, find next open time
  let nextOpenMessage = "";
  for (let i = 0; i < 7; i++) {
    const checkDayIndex = (currentDayIndex + i) % 7;
    const checkSchedule = schedule[checkDayIndex.toString()];

    if (checkSchedule && checkSchedule.isOpen) {
      const openTime = parseTime(checkSchedule.open);

      if (i === 0) {
        // Today
        const openMins = openTime.hours * 60 + openTime.minutes;
        const currentMins = currentTime.hours * 60 + currentTime.minutes;
        if (openMins > currentMins) {
          nextOpenMessage = `Abre hoje às ${checkSchedule.open}`;
          break;
        }
      } else if (i === 1) {
        nextOpenMessage = `Abre amanhã às ${checkSchedule.open}`;
        break;
      } else {
        nextOpenMessage = `Abre ${daysOfWeek[checkDayIndex]} às ${checkSchedule.open}`;
        break;
      }
    }
  }

  if (!nextOpenMessage) {
    nextOpenMessage = "Fechado temporariamente";
  }

  return { isOpen: false, nextOpenMessage };
}

export const createInitialCalendarData = () => {
  return {};
};

// Improved fuzzy matching - more accurate
export const findFuzzyMatch = (inputName, employeeList) => {
  if (!inputName || !employeeList || !Array.isArray(employeeList)) {
    return null;
  }

  const trimmedInput = inputName.trim().toLowerCase();
  if (!trimmedInput) return null;

  // First try exact match
  for (const employee of employeeList) {
    if (employee && employee.trim().toLowerCase() === trimmedInput) {
      return employee;
    }
  }

  // Then try partial matches
  for (const employee of employeeList) {
    if (!employee) continue;
    
    const trimmedEmployee = employee.trim().toLowerCase();
    if (!trimmedEmployee) continue;

    // Check if one contains the other
    if (trimmedEmployee.includes(trimmedInput) || trimmedInput.includes(trimmedEmployee)) {
      return employee;
    }

    // Check word-level matches
    const inputWords = trimmedInput.split(/\s+/);
    const employeeWords = trimmedEmployee.split(/\s+/);
    
    const matchingWords = inputWords.filter(word => 
      employeeWords.some(empWord => empWord.includes(word) || word.includes(empWord))
    );
    
    if (matchingWords.length >= Math.min(inputWords.length, employeeWords.length)) {
      return employee;
    }
  }

  return null;
};

export const applyWeeklyScheduleTemplate = (year, month, weekStartDate, WEEKLY_SCHEDULE_TEMPLATE) => {
  const scheduleData = {};
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStartDate);
    currentDate.setDate(weekStartDate.getDate() + i);
    
    const dayOfWeek = daysOfWeek[currentDate.getDay()];
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
    
    const dayTemplate = WEEKLY_SCHEDULE_TEMPLATE[dayOfWeek];
    if (dayTemplate) {
      scheduleData[dateKey] = {};
      
      Object.entries(dayTemplate).forEach(([timeSlot, employees]) => {
        scheduleData[dateKey][timeSlot] = {
          id: `${dateKey}-${timeSlot}`,
          names: employees
        };
      });
    }
  }
  
  return scheduleData;
};

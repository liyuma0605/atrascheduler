"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import React from "react";
import Header from "@/components/Header";
import Calendar from "@/components/Calendar";
import EmployeePayrollTable from "@/components/EmployeePayrollTable";
import Instructions from "@/components/Instructions";

import { MONTHS, INITIAL_PAYROLL_DATA, WEEKLY_SCHEDULE_TEMPLATE } from "@/utils/constants";
import { createInitialCalendarData, findFuzzyMatch, applyWeeklyScheduleTemplate } from "@/utils/helpers";
import { useDataManagement } from "@/hooks/useDataManagement";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { firebaseService } from "@/lib/firebaseService";

export default function ScheduleEditor() {
  const {
    monthlyScheduleData,
    setMonthlyScheduleData,
    monthlyPayrollData,
    setMonthlyPayrollData,
    monthlyRenderedDays,
    setMonthlyRenderedDays,
    employeeDetails,
    setEmployeeDetails,
    isDataLoaded,
    isLoading,
    error,
    loadAllData,
  } = useDataManagement();

  // User preferences managed by Firebase
  const {
    selectedMonth,
    selectedYear,
    redMarkedNames,
    isPreferencesLoaded,
    updateSelectedMonth,
    updateSelectedYear,
    updateRedMarkedNames,
  } = useUserPreferences();

  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("L2 OJT");
  const [selectedWeekForShifts, setSelectedWeekForShifts] = useState(1);
  const [selectedCutoffPeriod, setSelectedCutoffPeriod] = useState("15th");

  // Calculate the number of weeks in the selected month
  const weeksInMonth = useMemo(() => {
    const year = Number.parseInt(selectedYear);
    const monthIndex = MONTHS.indexOf(selectedMonth);
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
    
    // Find the first Sunday of the month (or before if month doesn't start on Sunday)
    const firstSunday = new Date(firstDayOfMonth);
    firstSunday.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
    
    // Find the last Sunday that contains any part of the month
    const lastSunday = new Date(lastDayOfMonth);
    lastSunday.setDate(lastDayOfMonth.getDate() - lastDayOfMonth.getDay());
    
    // Calculate total weeks
    const totalWeeks = Math.ceil((lastSunday.getTime() - firstSunday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
    
    return Math.min(totalWeeks, 6); // Cap at 6 weeks maximum
  }, [selectedMonth, selectedYear]);

  const currentMonthKey = `${selectedMonth}_${selectedYear}`;

  const scheduleData =
    monthlyScheduleData[currentMonthKey] || createInitialCalendarData();
  const payrollData =
    monthlyPayrollData[currentMonthKey] || INITIAL_PAYROLL_DATA;
  const renderedDays =
    monthlyRenderedDays[currentMonthKey] ||
    (() => {
      const initial = {};
      Object.entries(INITIAL_PAYROLL_DATA).forEach(([category, employees]) => {
        employees.forEach((employee) => {
          initial[employee] = 0;
        });
      });
      return initial;
    })();

  const sortedPayrollData = useMemo(() => {
    const sorted = {};
    const categories = Object.keys(payrollData);

    categories.forEach((category) => {
      // Sort employees within each category alphabetically
      sorted[category] = [...payrollData[category]].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
      );
    });

    return sorted;
  }, [payrollData]);

  const calculateShiftsForAllWeeks = useMemo(() => {
    const weeklyShifts = { 1: {}, 2: {}, 3: {}, 4: {} };

    // Initialize all employees with 0 for each week
    Object.entries(payrollData).forEach(([category, employees]) => {
      employees.forEach((employee) => {
        weeklyShifts[1][employee] = 0;
        weeklyShifts[2][employee] = 0;
        weeklyShifts[3][employee] = 0;
        weeklyShifts[4][employee] = 0;
      });
    });

    const year = Number.parseInt(selectedYear);
    const monthIndex = MONTHS.indexOf(selectedMonth);
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const firstSunday = new Date(firstDayOfMonth);
    firstSunday.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

    // Calculate shifts for each week
    for (let week = 1; week <= 4; week++) {
      const weekStartDate = new Date(firstSunday);
      weekStartDate.setDate(firstSunday.getDate() + (week - 1) * 7);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);

      const currentMonthKey = `${selectedYear}-${String(
        monthIndex + 1
      ).padStart(2, "0")}`;

      Object.entries(scheduleData).forEach(([dateKey, dayData]) => {
        if (dateKey.startsWith(currentMonthKey)) {
          const [yearStr, monthStr, dayStr] = dateKey.split("-");
          const scheduleDate = new Date(
            Number(yearStr),
            Number(monthStr) - 1,
            Number(dayStr)
          );

          if (scheduleDate >= weekStartDate && scheduleDate <= weekEndDate) {
            Object.entries(dayData).forEach(([timeSlot, slotData]) => {
              // Only count actual work shifts, exclude Day Off
              if (timeSlot !== "Day Off" && slotData.names && slotData.names.length > 0) {
                slotData.names.forEach((name) => {
                  const fuzzyMatch = findFuzzyMatch(name, Object.values(payrollData).flat());
                  if (fuzzyMatch) {
                    weeklyShifts[week][fuzzyMatch] = (weeklyShifts[week][fuzzyMatch] || 0) + 1;
                  }
                });
              }
            });
          }
        }
      });
    }

    return weeklyShifts;
  }, [scheduleData, payrollData, selectedMonth, selectedYear]);

  const calculateShiftsForAllCutoffs = useMemo(() => {
    const cutoffShifts = { "15th": {}, "30th": {} };

    // Initialize all employees with 0 for each cutoff
    Object.entries(payrollData).forEach(([category, employees]) => {
      employees.forEach((employee) => {
        cutoffShifts["15th"][employee] = 0;
        cutoffShifts["30th"][employee] = 0;
      });
    });

    const year = Number.parseInt(selectedYear);
    const monthIndex = MONTHS.indexOf(selectedMonth);
    const currentMonth = monthIndex + 1;
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? year - 1 : year;

    const processScheduleDataForCutoff = (data, cutoff) => {
      Object.entries(data).forEach(([dateKey, dayData]) => {
        const date = new Date(dateKey);
        const day = date.getDate();
        const month = date.getMonth() + 1; // JavaScript months are 0-indexed

        let isInCutoffPeriod = false;
        if (cutoff === "15th") {
          // 1st Cutoff: Previous month 26th → Current month 10th
          if (month === prevMonth && day >= 26) {
            isInCutoffPeriod = true;
          } else if (month === currentMonth && day <= 10) {
            isInCutoffPeriod = true;
          }
        } else if (cutoff === "30th") {
          // 2nd Cutoff: Current month 11th → Current month 25th
          if (month === currentMonth && day >= 11 && day <= 25) {
            isInCutoffPeriod = true;
          }
        }

        if (isInCutoffPeriod) {
          Object.entries(dayData).forEach(([timeSlot, slotData]) => {
            // Only count actual work shifts, exclude Day Off
            if (timeSlot !== "Day Off" && slotData.names && slotData.names.length > 0) {
              slotData.names.forEach((name) => {
                const fuzzyMatch = findFuzzyMatch(
                  name,
                  Object.values(payrollData).flat()
                );
                if (fuzzyMatch) {
                  cutoffShifts[cutoff][fuzzyMatch] =
                    (cutoffShifts[cutoff][fuzzyMatch] || 0) + 1;
                }
              });
            }
          });
        }
      });
    };

    // Process current month data for both cutoffs
    processScheduleDataForCutoff(scheduleData, "15th");
    processScheduleDataForCutoff(scheduleData, "30th");

    // Process previous month data for 15th cutoff
    const prevMonthKey = `${MONTHS[prevMonth - 1]}_${prevYear}`;
    const prevMonthScheduleData = monthlyScheduleData[prevMonthKey];
    if (prevMonthScheduleData) {
      processScheduleDataForCutoff(prevMonthScheduleData, "15th");
    }

    return cutoffShifts;
  }, [scheduleData, payrollData, selectedMonth, selectedYear, monthlyScheduleData]);

  useEffect(() => {
    if (!isDataLoaded) return; // Wait for initial data load

    const monthKey = `${selectedMonth}_${selectedYear}`;
    console.log(`Switching to month: ${monthKey}`);

    // Initialize month data if it doesn't exist
    if (!monthlyPayrollData[monthKey]) {
      console.log(`Initializing payroll data for ${monthKey}`);
      setMonthlyPayrollData((prev) => ({
        ...prev,
        [monthKey]: { ...INITIAL_PAYROLL_DATA },
      }));

      const initialRendered = {};
      Object.entries(INITIAL_PAYROLL_DATA).forEach(([category, employees]) => {
        employees.forEach((employee) => {
          initialRendered[employee] = 0;
        });
      });

      setMonthlyRenderedDays((prev) => ({
        ...prev,
        [monthKey]: initialRendered,
      }));
    }

    if (!monthlyScheduleData[monthKey]) {
      console.log(`Initializing schedule data for ${monthKey}`);
      setMonthlyScheduleData((prev) => ({
        ...prev,
        [monthKey]: createInitialCalendarData(),
      }));
    }
  }, [
    selectedMonth,
    selectedYear,
    monthlyPayrollData,
    monthlyScheduleData,
    isDataLoaded,
  ]);

  // User preferences are automatically managed by the useUserPreferences hook

  // Reset selected week when month changes
  useEffect(() => {
    if (selectedWeekForShifts > weeksInMonth) {
      setSelectedWeekForShifts(1);
    }
  }, [selectedMonth, selectedYear, weeksInMonth, selectedWeekForShifts]);

  const updateCurrentMonthSchedule = useCallback(
    (newScheduleData) => {
      setMonthlyScheduleData((prev) => ({
        ...prev,
        [currentMonthKey]: newScheduleData,
      }));
    },
    [currentMonthKey]
  );

  const updateCurrentMonthPayroll = useCallback(
    (newPayrollData) => {
      setMonthlyPayrollData((prev) => ({
        ...prev,
        [currentMonthKey]: newPayrollData,
      }));
    },
    [currentMonthKey]
  );

  const updateCurrentMonthRenderedDays = useCallback(
    (newRenderedDays) => {
      setMonthlyRenderedDays((prev) => ({
        ...prev,
        [currentMonthKey]: newRenderedDays,
      }));
    },
    [currentMonthKey]
  );

  useEffect(() => {
    const currentRendered = monthlyRenderedDays[currentMonthKey] || {};
    const updated = { ...currentRendered };
    let hasChanges = false;

    // Add any new employees that don't exist in renderedDays
    Object.entries(payrollData).forEach(([category, employees]) => {
      employees.forEach((employee) => {
        if (!(employee in updated)) {
          updated[employee] = 0;
          hasChanges = true;
        }
      });
    });

    // Remove employees that no longer exist in payrollData
    const allCurrentEmployees = Object.values(payrollData).flat();
    Object.keys(updated).forEach((employee) => {
      if (!allCurrentEmployees.includes(employee)) {
        delete updated[employee];
        hasChanges = true;
      }
    });

    // Only update if there are actual changes
    if (hasChanges) {
      updateCurrentMonthRenderedDays(updated);
    }
  }, [payrollData, currentMonthKey, updateCurrentMonthRenderedDays]);

  const calendarDays = useMemo(() => {
    const year = Number.parseInt(selectedYear);
    const monthIndex = MONTHS.indexOf(selectedMonth);
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(monthIndex + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      days.push({ day, dateKey });
    }

    return days;
  }, [selectedMonth, selectedYear]);

  const calculateExpectedShiftsMonth = useMemo(() => {
    const shiftCounts = {};

    // Initialize all employees with 0
    Object.entries(payrollData).forEach(([category, employees]) => {
      employees.forEach((employee) => {
        shiftCounts[employee] = 0;
      });
    });

    // Count shifts in current month only (excluding Day Off)
    const currentMonthKey = `${selectedYear}-${String(
      MONTHS.indexOf(selectedMonth) + 1
    ).padStart(2, "0")}`;

    Object.entries(scheduleData).forEach(([dateKey, dayData]) => {
      if (dateKey.startsWith(currentMonthKey)) {
        Object.entries(dayData).forEach(([timeSlot, slotData]) => {
          // Only count actual work shifts, exclude Day Off
          if (timeSlot !== "Day Off" && slotData.names && slotData.names.length > 0) {
            slotData.names.forEach((name) => {
              const fuzzyMatch = findFuzzyMatch(name, Object.values(payrollData).flat());
              if (fuzzyMatch) {
                shiftCounts[fuzzyMatch] = (shiftCounts[fuzzyMatch] || 0) + 1;
              }
            });
          }
        });
      }
    });

    return shiftCounts;
  }, [scheduleData, payrollData, selectedMonth, selectedYear]);

  const daysInMonth = useMemo(() => {
    const year = Number.parseInt(selectedYear);
    const monthIndex = MONTHS.indexOf(selectedMonth);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [selectedMonth, selectedYear]);

  const calculateExpectedShiftsWeek = useMemo(() => {
    const shiftCounts = {};

    // Initialize all employees with 0
    Object.entries(payrollData).forEach(([category, employees]) => {
      employees.forEach((employee) => {
        shiftCounts[employee] = 0;
      });
    });

    // Get the date range for the selected week (Sunday to Saturday)
    const year = Number.parseInt(selectedYear);
    const monthIndex = MONTHS.indexOf(selectedMonth);
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

    // Find the first Sunday of the month (or before if month doesn't start on Sunday)
    const firstSunday = new Date(firstDayOfMonth);
    firstSunday.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

    // Calculate the start and end dates for the selected week
    const weekStartDate = new Date(firstSunday);
    weekStartDate.setDate(
      firstSunday.getDate() + (selectedWeekForShifts - 1) * 7
    );

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6); // Saturday

    // Count shifts only for the selected week
    const currentMonthKey = `${selectedYear}-${String(monthIndex + 1).padStart(
      2,
      "0"
    )}`;

    Object.entries(scheduleData).forEach(([dateKey, dayData]) => {
      if (dateKey.startsWith(currentMonthKey)) {
        const [yearStr, monthStr, dayStr] = dateKey.split("-");
        const scheduleDate = new Date(
          Number(yearStr),
          Number(monthStr) - 1,
          Number(dayStr)
        );

        // Check if this date falls within the selected week
        if (scheduleDate >= weekStartDate && scheduleDate <= weekEndDate) {
          Object.entries(dayData).forEach(([timeSlot, slotData]) => {
            // Only count actual work shifts, exclude Day Off
            if (timeSlot !== "Day Off" && slotData.names && slotData.names.length > 0) {
              slotData.names.forEach((name) => {
                const fuzzyMatch = findFuzzyMatch(name, Object.values(payrollData).flat());
                if (fuzzyMatch) {
                  shiftCounts[fuzzyMatch] = (shiftCounts[fuzzyMatch] || 0) + 1;
                }
              });
            }
          });
        }
      }
    });

    return shiftCounts;
  }, [
    scheduleData,
    payrollData,
    selectedMonth,
    selectedYear,
    selectedWeekForShifts,
  ]);

  const calculateExpectedDaysCutoff = useMemo(() => {
    const cutoffCounts = {};

    // Initialize all employees with 0
    Object.entries(payrollData).forEach(([category, employees]) => {
      employees.forEach((employee) => {
        cutoffCounts[employee] = 0;
      });
    });

    const year = Number.parseInt(selectedYear);
    const monthIndex = MONTHS.indexOf(selectedMonth);
    const currentMonth = monthIndex + 1;
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? year - 1 : year;

    const processScheduleData = (data) => {
      Object.entries(data).forEach(([dateKey, dayData]) => {
        const date = new Date(dateKey);
        const day = date.getDate();
        const month = date.getMonth() + 1; // JavaScript months are 0-indexed

        let isInCutoffPeriod = false;
        if (selectedCutoffPeriod === "15th") {
          // 1st Cutoff: Previous month 26th → Current month 10th
          if (month === prevMonth && day >= 26) {
            isInCutoffPeriod = true;
          } else if (month === currentMonth && day <= 10) {
            isInCutoffPeriod = true;
          }
        } else if (selectedCutoffPeriod === "30th") {
          // 2nd Cutoff: Current month 11th → Current month 25th
          if (month === currentMonth && day >= 11 && day <= 25) {
            isInCutoffPeriod = true;
          }
        }

        if (isInCutoffPeriod) {
          Object.entries(dayData).forEach(([timeSlot, slotData]) => {
            // Only count actual work shifts, exclude Day Off
            if (timeSlot !== "Day Off" && slotData.names && slotData.names.length > 0) {
              slotData.names.forEach((name) => {
                const fuzzyMatch = findFuzzyMatch(
                  name,
                  Object.values(payrollData).flat()
                );
                if (fuzzyMatch) {
                  cutoffCounts[fuzzyMatch] =
                    (cutoffCounts[fuzzyMatch] || 0) + 1;
                }
              });
            }
          });
        }
      });
    };

    processScheduleData(scheduleData);

    // Process previous month data for 15th cutoff using Firebase data
    if (selectedCutoffPeriod === "15th") {
      const prevMonthKey = `${MONTHS[prevMonth - 1]}_${prevYear}`;
      const prevMonthScheduleData = monthlyScheduleData[prevMonthKey];
      if (prevMonthScheduleData) {
        processScheduleData(prevMonthScheduleData);
      }
    }

    return cutoffCounts;
  }, [
    scheduleData,
    payrollData,
    selectedMonth,
    selectedYear,
    selectedCutoffPeriod,
  ]);

  const handleCellClick = useCallback(
    (dateKey, timeSlot) => {
      setEditingCell({ dateKey, timeSlot });
      const currentNames =
        scheduleData[dateKey]?.[timeSlot]?.names?.join(", ") || "";
      setEditValue(currentNames);
    },
    [scheduleData]
  );

  const handleSaveEdit = useCallback(() => {
    const names = editValue
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    const newScheduleData = {
      ...scheduleData,
      [editingCell?.dateKey]: {
        ...scheduleData[editingCell?.dateKey],
        [editingCell?.timeSlot]: {
          id: `${editingCell?.dateKey}-${editingCell?.timeSlot}`,
          names,
        },
      },
    };

    updateCurrentMonthSchedule(newScheduleData);
    setEditingCell(null);
    setEditValue("");
  }, [editValue, scheduleData, editingCell, updateCurrentMonthSchedule]);

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue("");
  }, []);

  const handleRenderedDaysChange = useCallback(
    (employeeName, value) => {
      const newRenderedDays = {
        ...renderedDays,
        [employeeName]: Number.parseInt(value) || 0,
      };
      updateCurrentMonthRenderedDays(newRenderedDays);
    },
    [renderedDays, updateCurrentMonthRenderedDays]
  );

  const handleEmployeeDetailChange = (employeeName, field, value) => {
    setEmployeeDetails((prev) => ({
      ...prev,
      [employeeName]: {
        ...prev[employeeName],
        [field]: value,
      },
    }));
  };

  const saveSchedule = useCallback(async () => {
    try {
      // Create a complete backup using Firebase
      const backupKey = await firebaseService.createCompleteBackup();

      alert(
        `✅ Schedule and payroll data saved successfully!\n\nBackup created: ${backupKey}\n\nData includes:\n• ${
          Object.keys(monthlyScheduleData).length
        } months of schedule data\n• ${
          Object.keys(monthlyPayrollData).length
        } months of payroll data\n• All employee tracking information\n• User preferences`
      );
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("❌ Error saving data. Please try again or contact support.");
    }
  }, [
    monthlyScheduleData,
    monthlyPayrollData,
    monthlyRenderedDays,
    employeeDetails,
    selectedMonth,
    selectedYear,
  ]);

  const loadLatestBackup = useCallback(async () => {
    try {
      // Get all available backups and load the most recent one
      const backups = await firebaseService.getAllBackups();
      
      if (backups.length > 0) {
        const latestBackup = backups[0]; // Most recent backup
        await firebaseService.loadCompleteBackup(latestBackup.id);
        
        // Reload data after restore
        window.location.reload();
        
        alert(`✅ Latest backup loaded successfully!\nBackup: ${latestBackup.id}\nDate: ${new Date(latestBackup.timestamp).toLocaleString()}`);
      } else {
        alert("❌ No backup found.");
      }
    } catch (error) {
      console.error("Error loading backup:", error);
      alert("❌ Error loading backup.");
    }
  }, []);

  const exportToCSV = useCallback(() => {
    try {
      const csvData = [];
      const timestamp = new Date().toLocaleString();
      const monthYear = `${selectedMonth} ${selectedYear}`;

      csvData.push([`=== EMPLOYEE PAYROLL & SCHEDULE EXPORT ===`]);
      csvData.push([`Export Date: ${timestamp}`]);
      csvData.push([`Period: ${monthYear}`]);
      csvData.push([]);

      // Schedule data
      csvData.push(["=== SCHEDULE DATA ==="]);
      csvData.push([
        "Date",
        "Day",
        "Time Slot",
        "Assigned Personnel",
        "Personnel Count",
      ]);

      Object.entries(scheduleData).forEach(([dateKey, dayData]) => {
        const date = new Date(dateKey);
        const dayName = DAYS_OF_WEEK[date.getDay()];

        Object.entries(dayData).forEach(([timeSlot, slotData]) => {
          const personnel = slotData.names.join("; ");
          const personnelCount = slotData.names.length;
          csvData.push([
            dateKey,
            dayName,
            timeSlot,
            `"${personnel}"`,
            personnelCount,
          ]);
        });
      });

      csvData.push([]);
      csvData.push(["=== PAYROLL DATA ==="]);
      csvData.push([
        "Category",
        "Employee Name",
        "Date Hired",
        "Expected Shifts/Month",
        "Expected Shifts/Week 1",
        "Expected Shifts/Week 2",
        "Expected Shifts/Week 3",
        "Expected Shifts/Week 4",
        "Expected Days/Cutoff 15th",
        "Expected Days/Cutoff 30th",
        "Days Rendered",
      ]);

      Object.entries(sortedPayrollData).forEach(([category, employees]) => {
        employees.forEach((employee) => {
          const rendered = renderedDays[employee] || 0;
          const details = employeeDetails[employee] || {};
          const monthlyShifts = calculateExpectedShiftsMonth[employee] || 0;
          const week1Shifts = calculateShiftsForAllWeeks[1][employee] || 0;
          const week2Shifts = calculateShiftsForAllWeeks[2][employee] || 0;
          const week3Shifts = calculateShiftsForAllWeeks[3][employee] || 0;
          const week4Shifts = calculateShiftsForAllWeeks[4][employee] || 0;
          const cutoff15th =
            calculateShiftsForAllCutoffs["15th"][employee] || 0;
          const cutoff30th =
            calculateShiftsForAllCutoffs["30th"][employee] || 0;

          csvData.push([
            category,
            `"${employee}"`,
            details.dateHired || "Not Set",
            monthlyShifts,
            week1Shifts,
            week2Shifts,
            week3Shifts,
            week4Shifts,
            cutoff15th,
            cutoff30th,
            rendered,
          ]);
        });
      });

      csvData.push([]);
      csvData.push(["=== SUMMARY ==="]);
      const totalEmployees = Object.keys(renderedDays).length;
      const totalRenderedDays = Object.values(renderedDays).reduce(
        (sum, days) => sum + days,
        0
      );
      csvData.push([`Total Employees: ${totalEmployees}`]);
      csvData.push([`Total Rendered Days: ${totalRenderedDays}`]);

      const csvContent = csvData.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .split("T")[0];
        link.setAttribute(
          "download",
          `payroll_schedule_${selectedMonth}_${selectedYear}_${timestamp}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert(
          `✅ CSV exported successfully!\nFile: payroll_schedule_${selectedMonth}_${selectedYear}_${timestamp}.csv`
        );
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("❌ Error exporting CSV. Please try again.");
    }
  }, [
    scheduleData,
    renderedDays,
    selectedMonth,
    selectedYear,
    sortedPayrollData,
    employeeDetails,
    calculateExpectedShiftsMonth,
    calculateShiftsForAllWeeks,
    calculateShiftsForAllCutoffs,
  ]);

  const getFutureMonthKeys = useCallback(() => {
    const currentYear = Number.parseInt(selectedYear);
    const currentMonthIndex = MONTHS.indexOf(selectedMonth);
    const futureKeys = [];

    // Add remaining months in current year
    for (
      let monthIndex = currentMonthIndex;
      monthIndex < MONTHS.length;
      monthIndex++
    ) {
      futureKeys.push(`${MONTHS[monthIndex]}_${currentYear}`);
    }

    // Add all months in future years
    for (let year = currentYear + 1; year < currentYear + 10; year++) {
      for (let monthIndex = 0; monthIndex < MONTHS.length; monthIndex++) {
        futureKeys.push(`${MONTHS[monthIndex]}_${year}`);
      }
    }

    return futureKeys;
  }, [selectedMonth, selectedYear]);

  const addEmployee = useCallback(() => {
    if (newEmployeeName.trim() && selectedCategory) {
      const trimmedName = newEmployeeName.trim();

      if (payrollData[selectedCategory].includes(trimmedName)) {
        alert("Employee already exists in this category!");
        return;
      }

      const futureMonthKeys = getFutureMonthKeys();

      // Update payroll data for current and future months
      setMonthlyPayrollData((prev) => {
        const updated = { ...prev };

        futureMonthKeys.forEach((monthKey) => {
          if (!updated[monthKey]) {
            updated[monthKey] = { ...INITIAL_PAYROLL_DATA };
          }
          updated[monthKey] = {
            ...updated[monthKey],
            [selectedCategory]: [
              ...(updated[monthKey][selectedCategory] || []),
              trimmedName,
            ],
          };
        });

        return updated;
      });

      // Update rendered days for current and future months
      setMonthlyRenderedDays((prev) => {
        const updated = { ...prev };

        futureMonthKeys.forEach((monthKey) => {
          if (!updated[monthKey]) {
            const initial = {};
            Object.entries(INITIAL_PAYROLL_DATA).forEach(
              ([category, employees]) => {
                employees.forEach((employee) => {
                  initial[employee] = 0;
                });
              }
            );
            updated[monthKey] = initial;
          }
          updated[monthKey] = {
            ...updated[monthKey],
            [trimmedName]: 0,
          };
        });

        return updated;
      });

      // Initialize employee details
      setEmployeeDetails((prev) => ({
        ...prev,
        [trimmedName]: {},
      }));

      setNewEmployeeName("");
      alert(
        `Added ${trimmedName} to ${selectedCategory} for ${selectedMonth} ${selectedYear} and all future months`
      );
    }
  }, [
    newEmployeeName,
    selectedCategory,
    payrollData,
    selectedMonth,
    selectedYear,
    getFutureMonthKeys,
  ]);

  const removeEmployee = useCallback(
    (category, employeeName) => {
      if (
        window.confirm(
          `Are you sure you want to remove ${employeeName} from ${category}?\n\nThis will remove them from ${selectedMonth} ${selectedYear} and all future months, but preserve historical data from past months.`
        )
      ) {
        const futureMonthKeys = getFutureMonthKeys();

        // Update payroll data for current and future months
        setMonthlyPayrollData((prev) => {
          const updated = { ...prev };

          futureMonthKeys.forEach((monthKey) => {
            if (updated[monthKey] && updated[monthKey][category]) {
              updated[monthKey] = {
                ...updated[monthKey],
                [category]: updated[monthKey][category].filter(
                  (name) => name !== employeeName
                ),
              };
            }
          });

          return updated;
        });

        // Update rendered days for current and future months
        setMonthlyRenderedDays((prev) => {
          const updated = { ...prev };

          futureMonthKeys.forEach((monthKey) => {
            if (
              updated[monthKey] &&
              updated[monthKey][employeeName] !== undefined
            ) {
              const newMonthData = { ...updated[monthKey] };
              delete newMonthData[employeeName];
              updated[monthKey] = newMonthData;
            }
          });

          return updated;
        });

        // Remove employee details
        setEmployeeDetails((prev) => {
          const newState = { ...prev };
          delete newState[employeeName];
          return newState;
        });

        alert(
          `Removed ${employeeName} from ${category} for ${selectedMonth} ${selectedYear} and all future months`
        );
      }
    },
    [selectedMonth, selectedYear, getFutureMonthKeys]
  );

  const toggleNameColor = useCallback((dateKey, timeSlot, name, event) => {
    event.stopPropagation(); // Prevent cell editing when clicking on name

    const nameKey = `${dateKey}-${timeSlot}-${name}`;
    updateRedMarkedNames((prev) => {
      const newState = {
        ...prev,
        [nameKey]: !prev[nameKey],
      };
      // User preferences are automatically saved to Firebase
      return newState;
    });
  }, [updateRedMarkedNames]);

  const applyWeeklySchedule = useCallback(() => {
    if (window.confirm("This will apply the weekly schedule template to the current month. Any existing assignments will be overwritten. Continue?")) {
      const year = Number.parseInt(selectedYear);
      const monthIndex = MONTHS.indexOf(selectedMonth);
      const month = monthIndex + 1;
      
      // Get the first day of the month
      const firstDayOfMonth = new Date(year, monthIndex, 1);
      const firstSunday = new Date(firstDayOfMonth);
      firstSunday.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
      
      // Apply the weekly template for the entire month
      const newScheduleData = {};
      
      // Apply template for each week of the month
      for (let week = 0; week < 5; week++) { // Up to 5 weeks to cover the entire month
        const weekStartDate = new Date(firstSunday);
        weekStartDate.setDate(firstSunday.getDate() + (week * 7));
        
        const weekSchedule = applyWeeklyScheduleTemplate(year, month, weekStartDate, WEEKLY_SCHEDULE_TEMPLATE);
        
        // Only add dates that are within the current month
        Object.entries(weekSchedule).forEach(([dateKey, dayData]) => {
          const [yearStr, monthStr, dayStr] = dateKey.split("-");
          const scheduleDate = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
          const currentMonthStart = new Date(year, monthIndex, 1);
          const currentMonthEnd = new Date(year, monthIndex + 1, 0);
          
          if (scheduleDate >= currentMonthStart && scheduleDate <= currentMonthEnd) {
            newScheduleData[dateKey] = dayData;
          }
        });
      }
      
      updateCurrentMonthSchedule(newScheduleData);
      alert("✅ Weekly schedule template applied successfully!");
    }
  }, [selectedMonth, selectedYear, updateCurrentMonthSchedule]);

  const clearSchedule = useCallback(() => {
    if (window.confirm("This will clear all schedule assignments for the current month. This action cannot be undone. Continue?")) {
      updateCurrentMonthSchedule({});
      alert("✅ Schedule cleared successfully!");
    }
  }, [updateCurrentMonthSchedule]);



  // Wait for both data and preferences to be loaded
  if (!isDataLoaded || !isPreferencesLoaded) {
    return (
      <div className="p-6 max-w-full">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your schedule data...</p>
            {error && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {error}
                </p>
                <button
                  onClick={loadAllData}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full">
      <Header
        selectedMonth={selectedMonth}
        setSelectedMonth={updateSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={updateSelectedYear}
        onSaveSchedule={saveSchedule}
        onExportCSV={exportToCSV}
        onLoadBackup={loadLatestBackup}
        onApplyWeeklySchedule={applyWeeklySchedule}
        onClearSchedule={clearSchedule}
      />



      <Calendar
        calendarDays={calendarDays}
        scheduleData={scheduleData}
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        onCellClick={handleCellClick}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        redMarkedNames={redMarkedNames}
        onToggleNameColor={toggleNameColor}
        payrollData={payrollData}
        updateCurrentMonthSchedule={updateCurrentMonthSchedule}
      />

      <EmployeePayrollTable
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        sortedPayrollData={sortedPayrollData}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        newEmployeeName={newEmployeeName}
        setNewEmployeeName={setNewEmployeeName}
        onAddEmployee={addEmployee}
        onRemoveEmployee={removeEmployee}
        employeeDetails={employeeDetails}
        onEmployeeDetailChange={handleEmployeeDetailChange}
        renderedDays={renderedDays}
        onRenderedDaysChange={handleRenderedDaysChange}
        selectedWeekForShifts={selectedWeekForShifts}
        setSelectedWeekForShifts={setSelectedWeekForShifts}
        selectedCutoffPeriod={selectedCutoffPeriod}
        setSelectedCutoffPeriod={setSelectedCutoffPeriod}
        weeksInMonth={weeksInMonth}
        calculateExpectedShiftsMonth={calculateExpectedShiftsMonth}
        calculateExpectedShiftsWeek={calculateExpectedShiftsWeek}
        calculateExpectedDaysCutoff={calculateExpectedDaysCutoff}
      />

      <Instructions />
    </div>
  );
}



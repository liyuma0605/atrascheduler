"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Save, Edit3, Plus, Trash2, Upload } from "lucide-react";
import React from "react";

const PERMANENT_LOGO_URL =
  "https://cdn.discordapp.com/attachments/1346110313401155679/1405155664216592384/viber_image_2025-07-30_15-19-42-577.png?ex=689dccb0&is=689c7b30&hm=16262b6f756db6a87987062564aad5a1127b34677704cfd9b72fb74c6e451797&";

const TIME_SLOTS = [
  "8:00 AM - 4:00 PM",
  "4:00 PM - 12:00 AM",
  "12:00 AM - 8:00 AM",
  "DAY OFF",
];
const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const createInitialCalendarData = () => {
  return {};
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YEARS = Array.from(
  { length: 10 },
  (_, i) => new Date().getFullYear() + i - 2
);

const INITIAL_PAYROLL_DATA = {
  "L2 OJT": [
    "Alcontin, Joshua M.",
    "Angcos, Mark Joseph E.",
    "Cayao, Leomyr D.",
    "Chua, Hillary Gabriel G.",
    "Diano, Hitler",
    "Dusaran, John Paul E.",
    "Dusaran, John Paul E.",
    "Escamilla, Jan Denise J.",
    "Fernandez, Joanalyn Y.",
    "Manrique, Jeanne Leigh F.",
    "Martinez, Mart Angelo",
    "Miranda, Jaylord M.",
  ],
  APPRENTICESHIP: ["Pecha, Bernadine", "Salimbot, Jomar"],
  "L1 CYBER CADETS": [
    "Baluaro, Bernard",
    "Daquila, Eric John",
    "Diaz, Relyn Ann",
    "Cunanan, Kim Gerard",
    "Uson, John Clifford",
  ],
};

export default function ScheduleEditor() {
  const [monthlyScheduleData, setMonthlyScheduleData] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("selectedMonth") || MONTHS[new Date().getMonth()]
      );
    }
    return MONTHS[new Date().getMonth()];
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("selectedYear") ||
        new Date().getFullYear().toString()
      );
    }
    return new Date().getFullYear().toString();
  });

  const [monthlyPayrollData, setMonthlyPayrollData] = useState({});
  const [monthlyRenderedDays, setMonthlyRenderedDays] = useState({});

  const [redMarkedNames, setRedMarkedNames] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("redMarkedNames");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("L2 OJT");

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [employeeDetails, setEmployeeDetails] = useState({});

  const [selectedWeekForShifts, setSelectedWeekForShifts] = useState(1);

  const [selectedCutoffPeriod, setSelectedCutoffPeriod] = useState("15th");

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
              if (timeSlot !== "DAY OFF" && slotData.names) {
                slotData.names.forEach((name) => {
                  const trimmedName = name.trim().toLowerCase();

                  Object.entries(payrollData).forEach(
                    ([category, employees]) => {
                      employees.forEach((employee) => {
                        const fullName = employee.toLowerCase();
                        let nameParts = [];

                        if (fullName.includes(",")) {
                          const [lastName, firstPart] = fullName.split(",");
                          nameParts.push(lastName.trim());
                          if (firstPart) {
                            const firstNames = firstPart.trim().split(" ");
                            nameParts.push(...firstNames);
                          }
                        } else {
                          nameParts = fullName.split(" ");
                        }

                        const isMatch = nameParts.some((part) => {
                          return (
                            part.includes(trimmedName) ||
                            trimmedName.includes(part)
                          );
                        });

                        if (isMatch) {
                          weeklyShifts[week][employee]++;
                        }
                      });
                    }
                  );
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

        let isInCutoffPeriod = false;
        if (cutoff === "15th") {
          isInCutoffPeriod =
            (date.getMonth() === prevMonth - 1 && day >= 26) ||
            (date.getMonth() === monthIndex && day <= 10);
        } else if (cutoff === "30th") {
          isInCutoffPeriod =
            date.getMonth() === monthIndex && day >= 11 && day <= 25;
        }

        if (isInCutoffPeriod) {
          Object.entries(dayData).forEach(([timeSlot, slotData]) => {
            if (timeSlot !== "DAY OFF" && slotData.names) {
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
    if (typeof window !== "undefined") {
      const prevMonthKey = `${prevYear}-${prevMonth
        .toString()
        .padStart(2, "0")}`;
      const prevMonthData = localStorage.getItem(
        `scheduleData_${prevMonthKey}`
      );
      if (prevMonthData) {
        try {
          const parsedPrevMonthData = JSON.parse(prevMonthData);
          processScheduleDataForCutoff(parsedPrevMonthData, "15th");
        } catch (error) {
          console.log("[v0] Could not parse previous month data:", error);
        }
      }
    }

    return cutoffShifts;
  }, [scheduleData, payrollData, selectedMonth, selectedYear]);

  useEffect(() => {
    const loadSavedData = async () => {
      if (typeof window === "undefined") return;

      try {
        console.log("Starting data load process...");

        // Load main data
        const savedScheduleData = localStorage.getItem("monthlyScheduleData");
        const savedPayrollData = localStorage.getItem("monthlyPayrollData");
        const savedRenderedDays = localStorage.getItem("monthlyRenderedDays");
        const savedEmployeeDetails = localStorage.getItem("employeeDetails");

        let scheduleLoaded = false;
        let payrollLoaded = false;
        let renderedLoaded = false;
        let detailsLoaded = false;

        if (savedScheduleData) {
          const parsedScheduleData = JSON.parse(savedScheduleData);
          setMonthlyScheduleData(parsedScheduleData);
          scheduleLoaded = true;
          console.log(
            "Loaded schedule data:",
            Object.keys(parsedScheduleData).length,
            "months"
          );
        }

        if (savedPayrollData) {
          const parsedPayrollData = JSON.parse(savedPayrollData);
          setMonthlyPayrollData(parsedPayrollData);
          payrollLoaded = true;
          console.log(
            "Loaded payroll data:",
            Object.keys(parsedPayrollData).length,
            "months"
          );
        }

        if (savedRenderedDays) {
          const parsedRenderedDays = JSON.parse(savedRenderedDays);
          setMonthlyRenderedDays(parsedRenderedDays);
          renderedLoaded = true;
          console.log(
            "Loaded rendered days:",
            Object.keys(parsedRenderedDays).length,
            "months"
          );
        }

        if (savedEmployeeDetails) {
          const parsedEmployeeDetails = JSON.parse(savedEmployeeDetails);
          setEmployeeDetails(parsedEmployeeDetails);
          detailsLoaded = true;
          console.log(
            "Loaded employee details:",
            Object.keys(parsedEmployeeDetails).length,
            "employees"
          );
        }

        // Try backup data if main data failed to load
        const backupSchedule = localStorage.getItem(
          "backup_monthlyScheduleData"
        );
        const backupPayroll = localStorage.getItem("backup_monthlyPayrollData");
        const backupRendered = localStorage.getItem(
          "backup_monthlyRenderedDays"
        );
        const backupDetails = localStorage.getItem("backup_employeeDetails");

        if (backupSchedule && !scheduleLoaded) {
          setMonthlyScheduleData(JSON.parse(backupSchedule));
          console.log("Loaded from backup schedule data");
        }
        if (backupPayroll && !payrollLoaded) {
          setMonthlyPayrollData(JSON.parse(backupPayroll));
          console.log("Loaded from backup payroll data");
        }
        if (backupRendered && !renderedLoaded) {
          setMonthlyRenderedDays(JSON.parse(backupRendered));
          console.log("Loaded from backup rendered days");
        }
        if (backupDetails && !detailsLoaded) {
          setEmployeeDetails(JSON.parse(backupDetails));
          console.log("Loaded from backup employee details");
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
      } finally {
        setIsDataLoaded(true);
      }
    };

    loadSavedData();
  }, []);

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

  useEffect(() => {
    if (!isDataLoaded || typeof window === "undefined") return;

    try {
      localStorage.setItem(
        "monthlyScheduleData",
        JSON.stringify(monthlyScheduleData)
      );
      localStorage.setItem(
        "backup_monthlyScheduleData",
        JSON.stringify(monthlyScheduleData)
      );
      console.log("Auto-saved schedule data");
    } catch (error) {
      console.error("Error saving schedule data:", error);
    }
  }, [monthlyScheduleData, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded || typeof window === "undefined") return;

    try {
      localStorage.setItem(
        "monthlyPayrollData",
        JSON.stringify(monthlyPayrollData)
      );
      localStorage.setItem(
        "backup_monthlyPayrollData",
        JSON.stringify(monthlyPayrollData)
      );
      console.log("Auto-saved payroll data");
    } catch (error) {
      console.error("Error saving payroll data:", error);
    }
  }, [monthlyPayrollData, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded || typeof window === "undefined") return;

    try {
      localStorage.setItem(
        "monthlyRenderedDays",
        JSON.stringify(monthlyRenderedDays)
      );
      localStorage.setItem(
        "backup_monthlyRenderedDays",
        JSON.stringify(monthlyRenderedDays)
      );
      console.log("Auto-saved rendered days");
    } catch (error) {
      console.error("Error saving rendered days:", error);
    }
  }, [monthlyRenderedDays, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded || typeof window === "undefined") return;

    try {
      localStorage.setItem("employeeDetails", JSON.stringify(employeeDetails));
      localStorage.setItem(
        "backup_employeeDetails",
        JSON.stringify(employeeDetails)
      );
      console.log("Auto-saved employee details");
    } catch (error) {
      console.error("Error saving employee details:", error);
    }
  }, [employeeDetails, isDataLoaded]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedMonth", selectedMonth);
    }
  }, [selectedMonth]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedYear", selectedYear);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("redMarkedNames", JSON.stringify(redMarkedNames));
    }
  }, [redMarkedNames]);

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

    // Count shifts in current month only
    const currentMonthKey = `${selectedYear}-${String(
      MONTHS.indexOf(selectedMonth) + 1
    ).padStart(2, "0")}`;

    Object.entries(scheduleData).forEach(([dateKey, dayData]) => {
      if (dateKey.startsWith(currentMonthKey)) {
        Object.entries(dayData).forEach(([timeSlot, slotData]) => {
          if (timeSlot !== "DAY OFF" && slotData.names) {
            slotData.names.forEach((name) => {
              const trimmedName = name.trim().toLowerCase();

              Object.entries(payrollData).forEach(([category, employees]) => {
                employees.forEach((employee) => {
                  const fullName = employee.toLowerCase();
                  let nameParts = [];

                  if (fullName.includes(",")) {
                    const [lastName, firstPart] = fullName.split(",");
                    nameParts.push(lastName.trim());
                    if (firstPart) {
                      const firstNames = firstPart.trim().split(" ");
                      nameParts.push(...firstNames);
                    }
                  } else {
                    nameParts = fullName.split(" ");
                  }

                  const isMatch = nameParts.some((part) => {
                    return (
                      part.includes(trimmedName) || trimmedName.includes(part)
                    );
                  });

                  if (isMatch) {
                    shiftCounts[employee]++;
                  }
                });
              });
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
            if (timeSlot !== "DAY OFF" && slotData.names) {
              slotData.names.forEach((name) => {
                const trimmedName = name.trim().toLowerCase();

                Object.entries(payrollData).forEach(([category, employees]) => {
                  employees.forEach((employee) => {
                    const fullName = employee.toLowerCase();
                    let nameParts = [];

                    if (fullName.includes(",")) {
                      const [lastName, firstPart] = fullName.split(",");
                      nameParts.push(lastName.trim());
                      if (firstPart) {
                        const firstNames = firstPart.trim().split(" ");
                        nameParts.push(...firstNames);
                      }
                    } else {
                      nameParts = fullName.split(" ");
                    }

                    const isMatch = nameParts.some((part) => {
                      return (
                        part.includes(trimmedName) || trimmedName.includes(part)
                      );
                    });

                    if (isMatch) {
                      shiftCounts[employee]++;
                    }
                  });
                });
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

        let isInCutoffPeriod = false;
        if (selectedCutoffPeriod === "15th") {
          isInCutoffPeriod =
            (date.getMonth() === prevMonth - 1 && day >= 26) ||
            (date.getMonth() === monthIndex && day <= 10);
        } else if (selectedCutoffPeriod === "30th") {
          isInCutoffPeriod =
            date.getMonth() === monthIndex && day >= 11 && day <= 25;
        }

        if (isInCutoffPeriod) {
          Object.entries(dayData).forEach(([timeSlot, slotData]) => {
            if (timeSlot !== "DAY OFF" && slotData.names) {
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

    if (selectedCutoffPeriod === "15th" && typeof window !== "undefined") {
      const prevMonthKey = `${prevYear}-${prevMonth
        .toString()
        .padStart(2, "0")}`;
      const prevMonthData = localStorage.getItem(
        `scheduleData_${prevMonthKey}`
      );
      if (prevMonthData) {
        try {
          const parsedPrevMonthData = JSON.parse(prevMonthData);
          processScheduleData(parsedPrevMonthData);
        } catch (error) {
          console.log("[v0] Could not parse previous month data:", error);
        }
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

  const saveSchedule = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const scheduleKey = `scheduleData_${selectedYear}-${String(
        MONTHS.indexOf(selectedMonth) + 1
      ).padStart(2, "0")}`;

      const saveData = {
        monthlyScheduleData,
        monthlyPayrollData,
        monthlyRenderedDays,
        employeeDetails,
        currentMonth: selectedMonth,
        currentYear: selectedYear,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(scheduleKey, JSON.stringify(saveData));

      localStorage.setItem("latest_backup", JSON.stringify(saveData));

      alert(
        `✅ Schedule and payroll data saved successfully!\n\nBackup created: ${scheduleKey}\n\nData includes:\n• ${
          Object.keys(monthlyScheduleData).length
        } months of schedule data\n• ${
          Object.keys(monthlyPayrollData).length
        } months of payroll data\n• All employee tracking information`
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

  const loadLatestBackup = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const latestBackup = localStorage.getItem("latest_backup");
      if (latestBackup) {
        const backupData = JSON.parse(latestBackup);
        setMonthlyScheduleData(backupData.monthlyScheduleData || {});
        setMonthlyPayrollData(backupData.monthlyPayrollData || {});
        setMonthlyRenderedDays(backupData.monthlyRenderedDays || {});
        setEmployeeDetails(backupData.employeeDetails || {});
        alert("✅ Latest backup loaded successfully!");
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
        "Expected Shifts/Week 5",
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
    setRedMarkedNames((prev) => {
      const newState = {
        ...prev,
        [nameKey]: !prev[nameKey],
      };
      // Save to localStorage for persistence
      localStorage.setItem("redMarkedNames", JSON.stringify(newState));
      return newState;
    });
  }, []);

  const renderTimeSlot = (dateKey, timeSlot) => {
    const cellData = scheduleData[dateKey]?.[timeSlot];
    const isEditing =
      editingCell?.dateKey === dateKey && editingCell?.timeSlot === timeSlot;

    if (isEditing) {
      return (
        <div className="p-1 mb-1 rounded border bg-white border-blue-400">
          <div className="text-xs font-medium text-gray-600 mb-1">
            {timeSlot === "8:00 AM - 4:00 PM"
              ? "Shift 1"
              : timeSlot === "4:00 PM - 12:00 AM"
              ? "Shift 2"
              : timeSlot === "12:00 AM - 8:00 AM"
              ? "Shift 3"
              : "Day Off"}
          </div>
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveEdit();
              } else if (e.key === "Escape") {
                handleCancelEdit();
              }
            }}
            onBlur={handleSaveEdit}
            autoFocus
            className="text-xs h-6 p-1"
            placeholder="Enter names separated by commas"
          />
        </div>
      );
    }

    const getTimeSlotColor = (slot) => {
      switch (slot) {
        case "8:00 AM - 4:00 PM":
          return "bg-yellow-100 border-yellow-300";
        case "4:00 PM - 12:00 AM":
          return "bg-green-100 border-green-300";
        case "12:00 AM - 8:00 AM":
          return "bg-blue-100 border-blue-300";
        case "DAY OFF":
          return "bg-red-100 border-red-300";
        default:
          return "bg-gray-100 border-gray-300";
      }
    };

    return (
      <div
        className={`p-1 mb-1 rounded border cursor-pointer hover:opacity-80 transition-opacity group relative ${getTimeSlotColor(
          timeSlot
        )}`}
        onClick={() => handleCellClick(dateKey, timeSlot)}
      >
        <div className="text-xs font-medium text-gray-600 mb-1">
          {timeSlot === "8:00 AM - 4:00 PM"
            ? "Shift 1"
            : timeSlot === "4:00 PM - 12:00 AM"
            ? "Shift 2"
            : timeSlot === "12:00 AM - 8:00 AM"
            ? "Shift 3"
            : "Day Off"}
        </div>
        <div className="text-xs space-y-1">
          {cellData?.names?.map((name, index) => {
            const isDayOff = timeSlot === "DAY OFF";
            const nameKey = `${dateKey}-${timeSlot}-${name}`;
            const isRedMarked = redMarkedNames[nameKey];

            return (
              <div
                key={`${dateKey}-${timeSlot}-${name}-${index}`}
                className={`font-medium truncate ${
                  isDayOff
                    ? "text-blue-700" // Day off entries remain blue and non-clickable
                    : isRedMarked
                    ? "text-red-600 cursor-pointer hover:text-red-800" // Red when marked
                    : "text-black cursor-pointer hover:text-gray-700" // Black by default
                }`}
                onClick={
                  isDayOff
                    ? undefined
                    : (e) => toggleNameColor(dateKey, timeSlot, name, e)
                }
              >
                {name}
              </div>
            );
          }) || <div className="text-gray-400 italic">Click to assign</div>}
        </div>
        <Edit3 className="absolute top-1 right-1 w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      </div>
    );
  };

  return (
    <div className="p-6 max-w-full">
      {/* Header Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <img
              src={
                PERMANENT_LOGO_URL ||
                "https://cdn.discordapp.com/attachments/1346110313401155679/1405155664216592384/viber_image_2025-07-30_15-19-42-577.png?ex=689dccb0&is=689c7b30&hm=16262b6f756db6a87987062564aad5a1127b34677704cfd9b72fb74c6e451797&" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg"
              }
              alt="Company Logo"
              className="w-12 h-12 object-contain rounded-lg border border-gray-200"
              onError={(e) => {
                e.target.style.display = "none";
                const fallbackIcon = document.createElement("div");
                fallbackIcon.innerHTML =
                  '<svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 0-2H6z" clipRule="evenodd"></path></svg>';
                e.target.parentNode.appendChild(fallbackIcon);
              }}
            />
            <h1 className="text-3xl font-bold text-gray-800">
              ATRACaaS Shifting Calendar
            </h1>
          </div>
        </div>

        {/* Month/Year Selectors */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Month:</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Year:</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Gradient Header and Buttons */}
        <div className="w-full max-w-6xl bg-black text-yellow-300 text-center py-4 rounded-lg mb-6">
          <h2 className="text-2xl font-bold uppercase tracking-wide">
            {selectedMonth} {selectedYear}
          </h2>
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          <Button onClick={saveSchedule} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Schedule
          </Button>
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="flex items-center gap-2 bg-transparent hover:bg-green-50 border-green-600 text-green-600"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            onClick={loadLatestBackup}
            variant="outline"
            className="flex items-center gap-2 bg-transparent text-orange-600 border-orange-600 hover:bg-orange-50"
          >
            <Upload className="w-4 h-4" />
            Load Backup
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="max-w-6xl mx-auto mb-8">
        <CardContent className="p-0">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 bg-gray-600">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="p-3 text-center font-semibold text-white border-r border-gray-500 last:border-r-0"
              >
                {day.toUpperCase()}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((dayData, index) => (
              <div
                key={dayData?.dateKey || `empty-${index}`}
                className="min-h-[200px] border-r border-b border-gray-300 last:border-r-0 bg-white"
              >
                {dayData ? (
                  <div className="p-2">
                    {/* Day Number */}
                    <div className="text-sm font-bold text-gray-700 mb-2 text-center bg-gray-100 rounded px-2 py-1">
                      {dayData.day}
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-1">
                      {TIME_SLOTS.map((timeSlot) => (
                        <div key={`${dayData.dateKey}-${timeSlot}`}>
                          {renderTimeSlot(dayData.dateKey, timeSlot)}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 h-full"></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employee Payroll Tracking */}
      <Card className="max-w-6xl mx-auto mb-8">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Employee Payroll Tracking
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Current Month: {selectedMonth} {selectedYear} •{" "}
                <span className="text-green-600 font-medium">
                  Alphabetically Sorted
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(payrollData).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Employee name"
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addEmployee();
                  }
                }}
                className="w-40"
              />

              <Button
                onClick={addEmployee}
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    Employee Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    Date Hired
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    Expected Shifts/Month
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    <div className="flex flex-col items-center gap-2">
                      <span>Expected Shifts/Week</span>
                      <Select
                        value={selectedWeekForShifts}
                        onValueChange={(value) =>
                          setSelectedWeekForShifts(value)
                        }
                      >
                        <SelectTrigger className="w-20 h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={1}>Week 1</SelectItem>
                          <SelectItem value={2}>Week 2</SelectItem>
                          <SelectItem value={3}>Week 3</SelectItem>
                          <SelectItem value={4}>Week 4</SelectItem>
                          <SelectItem value={5}>Week 5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    <div className="flex flex-col items-center gap-2">
                      <span>Expected Days/Cutoff</span>

                      <Select
                        value={selectedCutoffPeriod}
                        onValueChange={(value) =>
                          setSelectedCutoffPeriod(value)
                        }
                      >
                        <SelectTrigger className="w-16 h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15th">15th</SelectItem>
                          <SelectItem value="30th">30th</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    Days Rendered
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(sortedPayrollData).map(
                  ([category, employees]) => (
                    <React.Fragment key={category}>
                      <tr className="bg-yellow-200">
                        <td
                          colSpan={7}
                          className="border border-gray-300 px-4 py-2 font-bold text-center"
                        >
                          {category}
                        </td>
                      </tr>
                      {employees.map((employee, index) => (
                        <tr
                          key={`${category}-${employee}-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="border border-gray-300 px-4 py-2">
                            {employee}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Input
                              type="date"
                              value={employeeDetails[employee]?.dateHired || ""}
                              onChange={(e) =>
                                handleEmployeeDetailChange(
                                  employee,
                                  "dateHired",
                                  e.target.value
                                )
                              }
                              className="w-36 h-8 text-center mx-auto text-xs border-2 border-blue-200 focus:border-blue-400 bg-white"
                              placeholder="Select date"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <div className="bg-gray-50 p-2 rounded text-center font-medium">
                              {calculateExpectedShiftsMonth[employee] || 0}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <div className="bg-gray-50 p-2 rounded text-center font-medium">
                              {calculateExpectedShiftsWeek[employee] || 0}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <div className="bg-gray-50 p-2 rounded text-center font-medium">
                              {calculateExpectedDaysCutoff[employee] || 0}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Input
                              type="number"
                              min="0"
                              value={renderedDays[employee] || 0}
                              onChange={(e) =>
                                handleRenderedDaysChange(
                                  employee,
                                  e.target.value
                                )
                              }
                              className="w-16 h-8 text-center mx-auto"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Button
                              onClick={() => removeEmployee(category, employee)}
                              size="sm"
                              variant="destructive"
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  )
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg max-w-6xl mx-auto">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ul className="text-sm space-y-1 text-gray-600">
          <li>• Select month and year from the dropdowns above</li>
          <li>
            •{" "}
            <strong>
              All data is automatically saved and preserved when switching
              months
            </strong>
          </li>
          <li>
            • Each month/year has its own separate schedule and payroll tracking
            record
          </li>
          <li>
            • Returning to a previous month will restore all your data exactly
            as you left it
          </li>
          <li>• Click on any time slot within a day to edit assignments</li>
          <li>• Enter multiple names separated by commas</li>
          <li>• Press Enter to save or Escape to cancel</li>
          <li>
            • Expected days are automatically calculated from calendar
            assignments (excluding Day Off)
          </li>
          <li>• Edit the "Days Rendered" column to track actual attendance</li>
          <li>• Use "Save Schedule" to create a backup export of your data</li>
          <li>• Use "Export CSV" to download both schedule and payroll data</li>
          <li>
            •{" "}
            <strong>
              If data disappears after reload, click "Load Backup" to restore
            </strong>
          </li>
          <li>
            •{" "}
            <strong>
              Employee Payroll Tracking table now displays in alphabetical order
              by category and employee name
            </strong>
          </li>
        </ul>
      </div>
    </div>
  );
}

const findFuzzyMatch = (inputName, employeeList) => {
  const trimmedInput = inputName.trim().toLowerCase();

  for (const employee of employeeList) {
    const trimmedEmployee = employee.trim().toLowerCase();

    if (
      trimmedEmployee.includes(trimmedInput) ||
      trimmedInput.includes(trimmedEmployee)
    ) {
      return employee;
    }

    const inputParts = trimmedInput.split(" ");
    const employeeParts = trimmedEmployee.split(" ");

    if (
      inputParts.some((part) => trimmedEmployee.includes(part)) ||
      employeeParts.some((part) => trimmedInput.includes(part))
    ) {
      return employee;
    }
  }

  return null;
};

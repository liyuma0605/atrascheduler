"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, Save, Upload } from "lucide-react"

const PERMANENT_LOGO_URL =
  "https://cdn.discordapp.com/attachments/1346110313401155679/1405155664216592384/viber_image_2025-07-30_15-19-42-577.png?ex=689dccb0&is=689c7b30&hm=16262b6f756db6a87987062564aad5a1127b34677704cfd9b72fb74c6e451797&"

const TIME_SLOTS = ["8:00 AM - 4:00 PM", "4:00 PM - 12:00 AM", "12:00 AM - 8:00 AM", "DAY OFF"]
const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const createInitialCalendarData = () => {
  return {}
}

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
]

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i - 2)

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
}

export default function ScheduleEditor() {
  const [monthlyScheduleData, setMonthlyScheduleData] = useState({})
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedMonth") || MONTHS[new Date().getMonth()]
    }
    return MONTHS[new Date().getMonth()]
  })
  const [selectedYear, setSelectedYear] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedYear") || new Date().getFullYear().toString()
    }
    return new Date().getFullYear().toString()
  })

  const [monthlyPayrollData, setMonthlyPayrollData] = useState({})
  const [monthlyRenderedDays, setMonthlyRenderedDays] = useState({})

  const [redMarkedNames, setRedMarkedNames] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("redMarkedNames")
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  const [newEmployeeName, setNewEmployeeName] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("L2 OJT")

  const [isDataLoaded, setIsDataLoaded] = useState(false)

  const [employeeDetails, setEmployeeDetails] = useState<{
    [employeeName: string]: {
      dateHired?: string
      expectedShiftsPerMonth?: number
      expectedShiftsPerWeek?: number
      expectedDaysPerCutoff?: number
    }
  }>({})

  const [selectedWeekForShifts, setSelectedWeekForShifts] = useState<number>(1)

  const [selectedCutoffPeriod, setSelectedCutoffPeriod] = useState<"15th" | "30th">("15th")

  const currentMonthKey = `${selectedMonth}_${selectedYear}`

  const scheduleData = monthlyScheduleData[currentMonthKey] || createInitialCalendarData()
  const payrollData = monthlyPayrollData[currentMonthKey] || INITIAL_PAYROLL_DATA
  const renderedDays =
    monthlyRenderedDays[currentMonthKey] ||
    (() => {
      const initial = {}
      Object.entries(INITIAL_PAYROLL_DATA).forEach(([category, employees]) => {
        employees.forEach((employee) => {
          initial[employee] = 0
        })
      })
      return initial
    })()

  const sortedPayrollData = useMemo(() => {
    const sorted = {}
    const categories = Object.keys(payrollData)

    categories.forEach((category) => {
      // Sort employees within each category alphabetically
      sorted[category] = [...payrollData[category]].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      )
    })

    return sorted
  }, [payrollData])

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        console.log("Starting data load process...")

        // Load main data
        const savedScheduleData = localStorage.getItem("monthlyScheduleData")
        const savedPayrollData = localStorage.getItem("monthlyPayrollData")
        const savedRenderedDays = localStorage.getItem("monthlyRenderedDays")
        const savedEmployeeDetails = localStorage.getItem("employeeDetails")

        let scheduleLoaded = false
        let payrollLoaded = false
        let renderedLoaded = false
        let detailsLoaded = false

        if (savedScheduleData) {
          const parsedScheduleData = JSON.parse(savedScheduleData)
          setMonthlyScheduleData(parsedScheduleData)
          scheduleLoaded = true
          console.log("Loaded schedule data:", Object.keys(parsedScheduleData).length, "months")
        }

        if (savedPayrollData) {
          const parsedPayrollData = JSON.parse(savedPayrollData)
          setMonthlyPayrollData(parsedPayrollData)
          payrollLoaded = true
          console.log("Loaded payroll data:", Object.keys(parsedPayrollData).length, "months")
        }

        if (savedRenderedDays) {
          const parsedRenderedDays = JSON.parse(savedRenderedDays)
          setMonthlyRenderedDays(parsedRenderedDays)
          renderedLoaded = true
          console.log("Loaded rendered days:", Object.keys(parsedRenderedDays).length, "months")
        }

        if (savedEmployeeDetails) {
          const parsedEmployeeDetails = JSON.parse(savedEmployeeDetails)
          setEmployeeDetails(parsedEmployeeDetails)
          detailsLoaded = true
          console.log("Loaded employee details:", Object.keys(parsedEmployeeDetails).length, "employees")
        }

        // Try backup data if main data failed to load
        const backupSchedule = localStorage.getItem("backup_monthlyScheduleData")
        const backupPayroll = localStorage.getItem("backup_monthlyPayrollData")
        const backupRendered = localStorage.getItem("backup_monthlyRenderedDays")
        const backupDetails = localStorage.getItem("backup_employeeDetails")

        if (backupSchedule && !scheduleLoaded) {
          setMonthlyScheduleData(JSON.parse(backupSchedule))
          console.log("Loaded from backup schedule data")
        }
        if (backupPayroll && !payrollLoaded) {
          setMonthlyPayrollData(JSON.parse(backupPayroll))
          console.log("Loaded from backup payroll data")
        }
        if (backupRendered && !renderedLoaded) {
          setMonthlyRenderedDays(JSON.parse(backupRendered))
          console.log("Loaded from backup rendered days")
        }
        if (backupDetails && !detailsLoaded) {
          setEmployeeDetails(JSON.parse(backupDetails))
          console.log("Loaded from backup employee details")
        }
      } catch (error) {
        console.error("Error loading saved data:", error)
      } finally {
        setIsDataLoaded(true)
      }
    }

    loadSavedData()
  }, [])

  useEffect(() => {
    if (!isDataLoaded) return // Wait for initial data load

    const monthKey = `${selectedMonth}_${selectedYear}`
    console.log(`Switching to month: ${monthKey}`)

    // Initialize month data if it doesn't exist
    if (!monthlyPayrollData[monthKey]) {
      console.log(`Initializing payroll data for ${monthKey}`)
      setMonthlyPayrollData((prev) => ({
        ...prev,
        [monthKey]: { ...INITIAL_PAYROLL_DATA },
      }))

      const initialRendered = {}
      Object.entries(INITIAL_PAYROLL_DATA).forEach(([category, employees]) => {
        employees.forEach((employee) => {
          initialRendered[employee] = 0
        })
      })

      setMonthlyRenderedDays((prev) => ({
        ...prev,
        [monthKey]: initialRendered,
      }))
    }

    if (!monthlyScheduleData[monthKey]) {
      console.log(`Initializing schedule data for ${monthKey}`)
      setMonthlyScheduleData((prev) => ({
        ...prev,
        [monthKey]: createInitialCalendarData(),
      }))
    }
  }, [selectedMonth, selectedYear, monthlyPayrollData, monthlyScheduleData, isDataLoaded])

  useEffect(() => {
    if (!isDataLoaded) return // Don't save until initial data is loaded

    try {
      localStorage.setItem("monthlyScheduleData", JSON.stringify(monthlyScheduleData))
      localStorage.setItem("backup_monthlyScheduleData", JSON.stringify(monthlyScheduleData))
      console.log("Auto-saved schedule data")
    } catch (error) {
      console.error("Error saving schedule data:", error)
    }
  }, [monthlyScheduleData, isDataLoaded])

  useEffect(() => {
    if (!isDataLoaded) return

    try {
      localStorage.setItem("monthlyPayrollData", JSON.stringify(monthlyPayrollData))
      localStorage.setItem("backup_monthlyPayrollData", JSON.stringify(monthlyPayrollData))
      console.log("Auto-saved payroll data")
    } catch (error) {
      console.error("Error saving payroll data:", error)
    }
  }, [monthlyPayrollData, isDataLoaded])

  useEffect(() => {
    if (!isDataLoaded) return

    try {
      localStorage.setItem("monthlyRenderedDays", JSON.stringify(monthlyRenderedDays))
      localStorage.setItem("backup_monthlyRenderedDays", JSON.stringify(monthlyRenderedDays))
      console.log("Auto-saved rendered days")
    } catch (error) {
      console.error("Error saving rendered days:", error)
    }
  }, [monthlyRenderedDays, isDataLoaded])

  useEffect(() => {
    if (!isDataLoaded) return

    try {
      localStorage.setItem("employeeDetails", JSON.stringify(employeeDetails))
      localStorage.setItem("backup_employeeDetails", JSON.stringify(employeeDetails))
      console.log("Auto-saved employee details")
    } catch (error) {
      console.error("Error saving employee details:", error)
    }
  }, [employeeDetails, isDataLoaded])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedMonth", selectedMonth)
    }
  }, [selectedMonth])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedYear", selectedYear)
    }
  }, [selectedYear])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("redMarkedNames", JSON.stringify(redMarkedNames))
    }
  }, [redMarkedNames])

  const updateCurrentMonthSchedule = useCallback(
    (newScheduleData) => {
      setMonthlyScheduleData((prev) => ({
        ...prev,
        [currentMonthKey]: newScheduleData,
      }))
    },
    [currentMonthKey],
  )

  const updateCurrentMonthPayroll = useCallback(
    (newPayrollData) => {
      setMonthlyPayrollData((prev) => ({
        ...prev,
        [currentMonthKey]: newPayrollData,
      }))
    },
    [currentMonthKey],
  )

  const updateCurrentMonthRenderedDays = useCallback(
    (newRenderedDays) => {
      setMonthlyRenderedDays((prev) => ({
        ...prev,
        [currentMonthKey]: newRenderedDays,
      }))
    },
    [currentMonthKey],
  )

  useEffect(() => {
    const currentRendered = monthlyRenderedDays[currentMonthKey] || {}
    const updated = { ...currentRendered }
    let hasChanges = false

    // Add any new employees that don't exist in renderedDays
    Object.entries(payrollData).forEach(([category, employees]) => {
      employees.forEach((employee) => {
        if (!(employee in updated)) {
          updated[employee] = 0
          hasChanges = true
        }
      })
    })

    // Remove employees that no longer exist in payrollData
    const allCurrentEmployees = Object.values(payrollData).flat()
    Object.keys(updated).forEach((employee) => {
      if (!allCurrentEmployees.includes(employee)) {
        delete updated[employee]
        hasChanges = true
      }
    })

    // Only update if there are actual changes
    if (hasChanges) {
      updateCurrentMonthRenderedDays(updated)
    }
  }, [payrollData, currentMonthKey, updateCurrentMonthRenderedDays])

  const calendarDays = useMemo(() => {
    const year = Number.parseInt(selectedYear)
    const monthIndex = MONTHS.indexOf(selectedMonth)
    const firstDay = new Date(year, monthIndex, 1)
    const lastDay = new Date(year, monthIndex + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      days.push({ day, dateKey })
    }

    return days
  }, [selectedMonth, selectedYear])

  const calculateExpectedDays = useMemo(() => {
    const expectedCounts = {}

    // Initialize all employees with 0
    Object.entries(payrollData).forEach(([category, employees]) => {
      employees.forEach((employee) => {
        expectedCounts[employee] = 0
      })
    })

    // Count appearances in calendar (excluding DAY OFF)
    Object.entries(scheduleData).forEach(([dateKey, dayData]) => {
      Object.entries(dayData).forEach(([timeSlot, slotData]) => {
        if (timeSlot !== "DAY OFF" && slotData.names) {
          slotData.names.forEach((name) => {
            const trimmedName = name.trim().toLowerCase()

            // Check against all employees for any name match
            Object.entries(payrollData).forEach(([category, employees]) => {
              employees.forEach((employee) => {
                const fullName = employee.toLowerCase()
                let nameParts = []

                if (fullName.includes(",")) {
                  // Handle "Last, First Middle" format
                  const [lastName, firstPart] = fullName.split(",")
                  nameParts.push(lastName.trim()) // Last name
                  if (firstPart) {
                    const firstNames = firstPart.trim().split(" ")
                    nameParts.push(...firstNames) // First name(s)
                  }
                } else {
                  // Handle "First Last" or "First Middle Last" format
                  nameParts = fullName.split(" ")
                }

                // Check if the calendar name matches any part of the employee's name
                const isMatch = nameParts.some((part) => {
                  return part.includes(trimmedName) || trimmedName.includes(part)
                })

                if (isMatch) {
                  expectedCounts[employee]++
                }
              })
            })
          })
        }
      })
    })

    return expectedCounts
  }, [scheduleData, payrollData])

  const calculateExpectedShiftsMonth = useMemo(() => {
    const shiftCounts = {}

    // Initialize all employees with 0
    Object.entries(payrollData).forEach(([category, employees]) => {
      employees.forEach((employee) => {
        shiftCounts[employee] = 0
      })
    })

    // Count shifts in current month only
    const currentMonthKey = `${selectedYear}-${String(MONTHS.indexOf(selectedMonth) + 1).padStart(2, "0")}`

    Object.entries(scheduleData).forEach(([dateKey, dayData]) => {
      if (dateKey.startsWith(currentMonthKey)) {
        Object.entries(dayData).forEach(([timeSlot, slotData]) => {
          if (timeSlot !== "DAY OFF" && slotData.names) {
            slotData.names.forEach((name) => {
              const trimmedName = name.trim().toLowerCase()

              Object.entries(payrollData).forEach(([category, employees]) => {
                employees.forEach((employee) => {
                  const fullName = employee.toLowerCase()
                  let nameParts = []

                  if (fullName.includes(",")) {
                    const [lastName, firstPart] = fullName.split(",")
                    nameParts.push(lastName.trim())
                    if (firstPart) {
                      const firstNames = firstPart.trim().split(" ")
                      nameParts.push(...firstNames)
                    }
                  } else {
                    nameParts = fullName.split(" ")
                  }

                  const isMatch = nameParts.some((part) => {
                    return part.includes(trimmedName) || trimmedName.includes(part)
                  })

                  if (isMatch) {
                    shiftCounts[employee]++
                  }
                })
              })
            })
          }
        })
      }
    })

    return shiftCounts
  }, [scheduleData, payrollData, selectedMonth, selectedYear])

  const daysInMonth = useMemo(() => {
    const year = Number.parseInt(selectedYear)
    const monthIndex = MONTHS.indexOf(selectedMonth)
    const lastDay = new Date(year, monthIndex + 1, 0)
    const daysInMonth = lastDay.getDate()

    const days = []
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }, [selectedMonth, selectedYear])

  const calculateExpectedShiftsWeek = useMemo(() => {
    const shiftCounts = {}

    // Initialize all employees with 0
    Object.entries(payrollData).forEach(([category, employees]) => {
      employees.forEach((employee) => {
        shiftCounts[employee] = 0
      })
    })

    // Get the date range for the selected week (Sunday to Saturday)
    const year = Number.parseInt(selectedYear)
    const monthIndex = MONTHS.indexOf(selectedMonth)
    const firstDayOfMonth = new Date(year, monthIndex, 1)
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0)

    // Find the first Sunday of the month (or before if month doesn't start on Sunday)
    const firstSunday = new Date(firstDayOfMonth)
    firstSunday.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay())

    // Calculate the start and end dates for the selected week
    const weekStartDate = new Date(firstSunday)
    weekStartDate.setDate(firstSunday.getDate() + (selectedWeekForShifts - 1) * 7)

    const weekEndDate = new Date(weekStartDate)
    weekEndDate.setDate(weekStartDate.getDate() + 6) // Saturday

    // Count shifts only for the selected week
    const currentMonthKey = `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}`

    Object.entries(scheduleData).forEach(([dateKey, dayData]) => {
      if (dateKey.startsWith(currentMonthKey)) {
        const [yearStr, monthStr, dayStr] = dateKey.split("-")
        const scheduleDate = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr))

        // Check if this date falls within the selected week
        if (scheduleDate >= weekStartDate && scheduleDate <= weekEndDate) {
          Object.entries(dayData).forEach(([timeSlot, slotData]) => {
            if (timeSlot !== "DAY OFF" && slotData.names) {
              slotData.names.forEach((name) => {
                const trimmedName = name.trim().toLowerCase()

                Object.entries(payrollData).forEach(([category, employees]) => {
                  employees.forEach((employee) => {
                    const fullName = employee.toLowerCase()
                    let nameParts = []

                    if (fullName.includes(",")) {
                      const [lastName, firstPart] = fullName.split(",")
                      nameParts.push(lastName.trim())
                      if (firstPart) {
                        const firstNames = firstPart.trim().split(" ")
                        nameParts.push(...firstNames)
                      }
                    } else {
                      nameParts = fullName.split(" ")
                    }

                    const isMatch = nameParts.some((part) => {
                      return part.includes(trimmedName) || trimmedName.includes(part)
                    })

                    if (isMatch) {
                      shiftCounts[employee]++
                    }
                  })
                })
              })
            }
          })
        }
      }
    })

    return shiftCounts
  }, [scheduleData, payrollData, selectedMonth, selectedYear, selectedWeekForShifts])

  const calculateExpectedDaysCutoff = useMemo(() => {
    const cutoffCounts = {}

    // Initialize all employees with 0
    Object.entries(payrollData).forEach(([category, employees]) => {
      employees.forEach((employee) => {
        cutoffCounts[employee] = 0
      })
    })

    const year = Number.parseInt(selectedYear)
    const monthIndex = MONTHS.indexOf(selectedMonth)
    const currentMonth = monthIndex + 1
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const prevYear = currentMonth === 1 ? year - 1 : year

    const isDateInCutoffPeriod = (scheduleDate: Date) => {
      if (selectedCutoffPeriod === "15th") {
        const startDate = new Date(year, prevMonth - 1, 26)
        const endDate = new Date(year, monthIndex, 10)
        return scheduleDate >= startDate && scheduleDate <= endDate
      } else {
        // 11th to 25th of current month
        const startDate = new Date(year, monthIndex, 11)
        const endDate = new Date(year, monthIndex, 25)
        return scheduleDate >= startDate && scheduleDate <= endDate
      }
    }

    const processScheduleData = (dataToProcess: any) => {
      Object.entries(dataToProcess).forEach(([dateKey, dayData]) => {
        const [yearStr, monthStr, dayStr] = dateKey.split("-")
        const scheduleDate = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr))

        if (isDateInCutoffPeriod(scheduleDate)) {
          Object.entries(dayData).forEach(([timeSlot, slotData]) => {
            if (timeSlot !== "DAY OFF" && slotData.names) {
              slotData.names.forEach((name) => {
                const trimmedName = name.trim().toLowerCase()

                Object.entries(payrollData).forEach(([category, employees]) => {
                  employees.forEach((employee) => {
                    const fullName = employee.toLowerCase()
                    let nameParts = []

                    if (fullName.includes(",")) {
                      const [lastName, firstPart] = fullName.split(",")
                      nameParts.push(lastName.trim())
                      if (firstPart) {
                        const firstNames = firstPart.trim().split(" ")
                        nameParts.push(...firstNames)
                      }
                    } else {
                      nameParts = fullName.split(" ")
                    }

                    const isMatch = nameParts.some((part) => {
                      return part.includes(trimmedName) || trimmedName.includes(part)
                    })

                    if (isMatch) {
                      cutoffCounts[employee]++
                    }
                  })
                })
              })
            }
          })
        }
      })
    }

    // Process current month data
    processScheduleData(scheduleData)

    if (selectedCutoffPeriod === "15th") {
      const prevMonthKey = `${prevYear}-${prevMonth.toString().padStart(2, "0")}`
      const prevMonthData = localStorage.getItem(`scheduleData_${prevMonthKey}`)
      if (prevMonthData) {
        try {
          const parsedPrevMonthData = JSON.parse(prevMonthData)
          processScheduleData(parsedPrevMonthData)
        } catch (error) {
          console.log("[v0] Could not parse previous month data:", error)
        }
      }
    }

    return cutoffCounts
  }, [scheduleData, payrollData, selectedMonth, selectedYear, selectedCutoffPeriod])

  const handleCellClick = useCallback(
    (dateKey, timeSlot) => {
      setEditingCell({ dateKey, timeSlot })
      const currentNames = scheduleData[dateKey]?.[timeSlot]?.names?.join(", ") || ""
      setEditValue(currentNames)
    },
    [scheduleData],
  )

  const handleSaveEdit = useCallback(() => {
    const names = editValue
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0)

    const newScheduleData = {
      ...scheduleData,
      [editingCell?.dateKey]: {
        ...scheduleData[editingCell?.dateKey],
        [editingCell?.timeSlot]: {
          id: `${editingCell?.dateKey}-${editingCell?.timeSlot}`,
          names,
        },
      },
    }

    updateCurrentMonthSchedule(newScheduleData)
    setEditingCell(null)
    setEditValue("")
  }, [editValue, scheduleData, editingCell, updateCurrentMonthSchedule])

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null)
    setEditValue("")
  }, [])

  const handleRenderedDaysChange = useCallback(
    (employeeName, value) => {
      const newRenderedDays = {
        ...renderedDays,
        [employeeName]: Number.parseInt(value) || 0,
      }
      updateCurrentMonthRenderedDays(newRenderedDays)
    },
    [renderedDays, updateCurrentMonthRenderedDays],
  )

  const handleEmployeeDetailChange = (employeeName: string, field: string, value: string | number) => {
    setEmployeeDetails((prev) => ({
      ...prev,
      [employeeName]: {
        ...prev[employeeName],
        [field]: value,
      },
    }))
  }

  const saveSchedule = useCallback(() => {
    try {
      const timestamp = new Date().toISOString().split("T")[0]
      const scheduleKey = `schedule_${selectedMonth}_${selectedYear}_${timestamp}`

      const saveData = {
        monthlyScheduleData,
        monthlyPayrollData,
        monthlyRenderedDays,
        employeeDetails,
        currentMonth: selectedMonth,
        currentYear: selectedYear,
        timestamp: new Date().toISOString(),
      }

      localStorage.setItem(scheduleKey, JSON.stringify(saveData))

      localStorage.setItem("latest_backup", JSON.stringify(saveData))

      alert(
        `✅ Schedule and payroll data saved successfully!\n\nBackup created: ${scheduleKey}\n\nData includes:\n• ${Object.keys(monthlyScheduleData).length} months of schedule data\n• ${Object.keys(monthlyPayrollData).length} months of payroll data\n• All employee tracking information`,
      )
    } catch (error) {
      console.error("Error saving schedule:", error)
      alert("❌ Error saving data. Please try again or contact support.")
    }
  }, [monthlyScheduleData, monthlyPayrollData, monthlyRenderedDays, employeeDetails, selectedMonth, selectedYear])

  const loadLatestBackup = useCallback(() => {
    try {
      const latestBackup = localStorage.getItem("latest_backup")
      if (latestBackup) {
        const backupData = JSON.parse(latestBackup)
        setMonthlyScheduleData(backupData.monthlyScheduleData || {})
        setMonthlyPayrollData(backupData.monthlyPayrollData || {})
        setMonthlyRenderedDays(backupData.monthlyRenderedDays || {})
        setEmployeeDetails(backupData.employeeDetails || {})
        alert("✅ Latest backup loaded successfully!")
      } else {
        alert("❌ No backup found.")
      }
    } catch (error) {
      console.error("Error loading backup:", error)
      alert("❌ Error loading backup.")
    }
  }, [])

  const exportToCSV = useCallback(() => {
    const csvData = []
    const currentDate = new Date().toLocaleDateString()

    // Header with metadata
    csvData.push([`Employee Payroll & Schedule Report - ${selectedMonth} ${selectedYear}`])
    csvData.push([`Generated on: ${currentDate}`])
    csvData.push([])

    // Enhanced Payroll Data Section
    csvData.push(["=== EMPLOYEE PAYROLL TRACKING ==="])
    csvData.push([
      "Category",
      "Employee Name",
      "Date Hired",
      "Expected Shifts/Month",
      "Expected Shifts/Week",
      "Expected Days/Cutoff",
      "Expected Days (Schedule)",
      "Days Rendered",
      "Performance (%)",
    ])

    Object.entries(sortedPayrollData).forEach(([category, employees]) => {
      employees.forEach((employee) => {
        const expected = calculateExpectedDays[employee] || 0
        const rendered = renderedDays[employee] || 0
        const details = employeeDetails[employee] || {}
        const performance = expected > 0 ? Math.round((rendered / expected) * 100) : 0

        csvData.push([
          `"${category}"`,
          `"${employee}"`,
          details.dateHired || "Not Set",
          details.expectedShiftsPerMonth || "Not Set",
          details.expectedShiftsPerWeek || "Not Set",
          details.expectedDaysPerCutoff || "Not Set",
          expected,
          rendered,
          `${performance}%`,
        ])
      })
      // Add separator between categories
      csvData.push([])
    })

    csvData.push([])
    csvData.push(["=== DETAILED SCHEDULE DATA ==="])
    csvData.push(["Date", "Day", "Time Slot", "Assigned Personnel", "Personnel Count"])

    // Enhanced schedule data with counts
    Object.entries(scheduleData).forEach(([dateKey, dayData]) => {
      const date = new Date(dateKey)
      const dayName = DAYS_OF_WEEK[date.getDay()]

      Object.entries(dayData).forEach(([timeSlot, slotData]) => {
        const personnel = slotData.names.join("; ")
        const personnelCount = slotData.names.length
        csvData.push([dateKey, dayName, timeSlot, `"${personnel}"`, personnelCount])
      })
    })

    // Summary section
    csvData.push([])
    csvData.push(["=== SUMMARY STATISTICS ==="])
    const totalEmployees = Object.values(sortedPayrollData).reduce((sum, employees) => sum + employees.length, 0)
    const totalScheduledDays = Object.keys(scheduleData).length
    csvData.push(["Total Employees", totalEmployees])
    csvData.push(["Total Scheduled Days", totalScheduledDays])
    csvData.push(["Report Period", `${selectedMonth} ${selectedYear}`])

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `payroll_schedule_report_${selectedMonth}_${selectedYear}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Show success feedback
      alert(`✅ CSV report exported successfully!\nFile: payroll_schedule_report_${selectedMonth}_${selectedYear}.csv`)
    }
  }, [
    scheduleData,
    renderedDays,
    calculateExpectedDays,
    selectedMonth,
    selectedYear,
    sortedPayrollData,
    employeeDetails,
  ])

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      <Button onClick={saveSchedule} className="flex items-center gap-2">
        <Save className="w-4 h-4" />
        Save Schedule
      </Button>
      <Button
        onClick={exportToCSV}
        variant="outline"
        className="flex items-center gap-2 bg-green-50 border-green-600 text-green-700 hover:bg-green-100 hover:border-green-700"
      >
        <Download className="w-4 h-4" />
        Export Report (CSV)
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
  )
}

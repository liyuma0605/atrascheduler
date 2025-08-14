"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Save, Edit3, Calendar, Plus, Trash2, Upload, X } from "lucide-react"
import React from "react"

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

// ATR & Associates CISO Logo as base64
const ATR_LOGO = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDAwMDAwIiByeD0iMTAiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+CjxkZWZzPgo8c3R5bGU+Cjpob3N0IHsKZm9udC1mYW1pbHk6IEFyaWFsLCBzYW5zLXNlcmlmOwp9Cjwvc3R5bGU+CjwvZGVmcz4KPCEtLSBBVFIgJiBBU1NPQ0lBVEVTIExvZ28gLS0+CjxnIGZpbGw9IiNGRkQ3MDAiPgo8IS0tIEEgU2hhcGUgLS0+CjxwYXRoIGQ9Ik0xNSAyNUwyNSAxNUwzNSAyNUwzMCAzMEwzNSAzNUwyNSA0NUwxNSAzNUwyMCAzMFoiLz4KPHN0cm9rZSBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZT0iI0ZGRDcwMCIgZmlsbD0ibm9uZSIgZD0iTTE4IDI4bDQtNGg2bDQgNHY0aC02bC00LTRaIi8+CjxjaXJjbGUgY3g9IjE1IiBjeT0iMjUiIHI9IjIiLz4KPGNpcmNsZSBjeD0iMzUiIGN5PSIyNSIgcj0iMiIvPgo8Y2lyY2xlIGN4PSIxNSIgY3k9IjM1IiByPSIyIi8+CjxjaXJjbGUgY3g9IjM1IiBjeT0iMzUiIHI9IjIiLz4KPCEtLSBBdHRyYWN0aXZlIFdvb2QgVGV4dHVyZSAtLT4KPHBhdGggZD0iTTQ1IDI1djE1aDE1VjI1SDQ1WiIgZmlsbD0iIzQ0NDQwMCIvPgo8IS0tIFdvb2QgR3JhaW4gLS0+CjxyZWN0IHg9IjQ1IiB5PSIyNiIgd2lkdGg9IjE1IiBoZWlnaHQ9IjIiIGZpbGw9IiNGRkQ3MDAiLz4KPHJlY3QgeD0iNDUiIHk9IjI5IiB3aWR0aD0iMTUiIGhlaWdodD0iMiIgZmlsbD0iI0ZGRDcwMCIvPgo8cmVjdCB4PSI0NSIgeT0iMzIiIHdpZHRoPSIxNSIgaGVpZ2h0PSIyIiBmaWxsPSIjRkZENzAwIi8+CjxyZWN0IHg9IjQ1IiB5PSIzNSIgd2lkdGg9IjE1IiBoZWlnaHQ9IjIiIGZpbGw9IiNGRkQ3MDAiLz4KPHJlY3QgeD0iNDUiIHk9IjM4IiB3aWR0aD0iMTUiIGhlaWdodD0iMiIgZmlsbD0iI0ZGRDcwMCIvPgo8L2c+Cgo8IS0tIFRleHQgLS0+Cjx0ZXh0IHg9IjIiIHk9IjU1IiBmaWxsPSIjRkZENzAwIiBmb250LXNpemU9IjgiIGZvbnQtd2VpZ2h0PSJib2xkIj5BVFIgJmFtcDsgQVNTT0NJQVRFUzwvdGV4dD4KPHR4dCB4PSIyIiB5PSI2NSIgZmlsbD0iI0ZGRDcwMCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPkNJU088L3RleHQ+Cjx0ZXh0IHg9IjIiIHk9Ijc1IiBmaWxsPSIjRkZENzAwIiBmb250LXNpemU9IjciPmFzIGEgU2VydmljZTwvdGV4dD4KPC9zdmc+Cjwvc3ZnPgo="

export default function ScheduleEditor() {
  const [monthlyScheduleData, setMonthlyScheduleData] = useState({})
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  const [monthlyPayrollData, setMonthlyPayrollData] = useState({})
  const [monthlyRenderedDays, setMonthlyRenderedDays] = useState({})

  const [newEmployeeName, setNewEmployeeName] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("L2 OJT")

  // ATR Logo is now permanent and cannot be edited
  const logoUrl = ATR_LOGO

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
    const monthKey = `${selectedMonth}_${selectedYear}`

    // Initialize month data if it doesn't exist
    if (!monthlyPayrollData[monthKey]) {
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
      setMonthlyScheduleData((prev) => ({
        ...prev,
        [monthKey]: createInitialCalendarData(),
      }))
    }
  }, [selectedMonth, selectedYear, monthlyPayrollData, monthlyScheduleData])

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

                // Extract different parts of the full name for matching
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

  const handleCellClick = useCallback(
    (dateKey, timeSlot) => {
      const cellId = `${dateKey}-${timeSlot}`
      const currentNames = scheduleData[dateKey]?.[timeSlot]?.names?.join(", ") || ""
      setEditingCell(cellId)
      setEditValue(currentNames)
    },
    [scheduleData],
  )

  const handleCellSave = useCallback(
    (dateKey, timeSlot) => {
      const names = editValue
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name.length > 0)

      const newScheduleData = {
        ...scheduleData,
        [dateKey]: {
          ...scheduleData[dateKey],
          [timeSlot]: {
            id: `${dateKey}-${timeSlot}`,
            names,
          },
        },
      }

      updateCurrentMonthSchedule(newScheduleData)
      setEditingCell(null)
      setEditValue("")
    },
    [editValue, scheduleData, updateCurrentMonthSchedule],
  )

  const handleCellCancel = useCallback(() => {
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

  const saveSchedule = useCallback(() => {
    const timestamp = new Date().toISOString().split("T")[0]
    
    const saveData = {
      monthlyScheduleData,
      monthlyPayrollData,
      monthlyRenderedDays,
      currentMonth: selectedMonth,
      currentYear: selectedYear,
      timestamp: new Date().toISOString(),
    }

    // In a real application, this would save to a backend or download as file
    const jsonData = JSON.stringify(saveData, null, 2)
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `schedule_backup_${selectedMonth}_${selectedYear}_${timestamp}.json`
    link.click()
    URL.revokeObjectURL(url)

    alert(
      `✅ Schedule and payroll data saved as download!\n\nBackup created: schedule_backup_${selectedMonth}_${selectedYear}_${timestamp}.json\n\nData includes:\n• ${Object.keys(monthlyScheduleData).length} months of schedule data\n• ${Object.keys(monthlyPayrollData).length} months of payroll data\n• All employee tracking information`,
    )
  }, [monthlyScheduleData, monthlyPayrollData, monthlyRenderedDays, selectedMonth, selectedYear])

  const exportToCSV = useCallback(() => {
    const csvData = []

    // Schedule data
    csvData.push(["=== SCHEDULE DATA ==="])
    csvData.push(["Date", "Day", "Time Slot", "Assigned Personnel"])

    Object.entries(scheduleData).forEach(([dateKey, dayData]) => {
      const date = new Date(dateKey)
      const dayName = DAYS_OF_WEEK[date.getDay()]

      Object.entries(dayData).forEach(([timeSlot, slotData]) => {
        const personnel = slotData.names.join("; ")
        csvData.push([dateKey, dayName, timeSlot, `"${personnel}"`])
      })
    })

    csvData.push([])
    csvData.push(["=== PAYROLL DATA ==="])
    csvData.push(["Category", "Employee Name", "Expected Days", "Days Rendered"])

    Object.entries(payrollData).forEach(([category, employees]) => {
      employees.forEach((employee) => {
        const expected = calculateExpectedDays[employee] || 0
        const rendered = renderedDays[employee] || 0
        csvData.push([category, `"${employee}"`, expected, rendered])
      })
    })

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `schedule_payroll_${selectedMonth}_${selectedYear}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [scheduleData, renderedDays, calculateExpectedDays, selectedMonth, selectedYear, payrollData])

  const getFutureMonthKeys = useCallback(() => {
    const currentYear = Number.parseInt(selectedYear)
    const currentMonthIndex = MONTHS.indexOf(selectedMonth)
    const futureKeys = []

    // Add remaining months in current year
    for (let monthIndex = currentMonthIndex; monthIndex < MONTHS.length; monthIndex++) {
      futureKeys.push(`${MONTHS[monthIndex]}_${currentYear}`)
    }

    // Add all months in future years
    for (let year = currentYear + 1; year < currentYear + 10; year++) {
      for (let monthIndex = 0; monthIndex < MONTHS.length; monthIndex++) {
        futureKeys.push(`${MONTHS[monthIndex]}_${year}`)
      }
    }

    return futureKeys
  }, [selectedMonth, selectedYear])

  const addEmployee = useCallback(() => {
    if (newEmployeeName.trim() && selectedCategory) {
      const trimmedName = newEmployeeName.trim()

      if (payrollData[selectedCategory].includes(trimmedName)) {
        alert("Employee already exists in this category!")
        return
      }

      const futureMonthKeys = getFutureMonthKeys()

      // Update payroll data for current and future months
      setMonthlyPayrollData((prev) => {
        const updated = { ...prev }

        futureMonthKeys.forEach((monthKey) => {
          if (!updated[monthKey]) {
            updated[monthKey] = { ...INITIAL_PAYROLL_DATA }
          }
          updated[monthKey] = {
            ...updated[monthKey],
            [selectedCategory]: [...(updated[monthKey][selectedCategory] || []), trimmedName],
          }
        })

        return updated
      })

      // Update rendered days for current and future months
      setMonthlyRenderedDays((prev) => {
        const updated = { ...prev }

        futureMonthKeys.forEach((monthKey) => {
          if (!updated[monthKey]) {
            const initial = {}
            Object.entries(INITIAL_PAYROLL_DATA).forEach(([category, employees]) => {
              employees.forEach((employee) => {
                initial[employee] = 0
              })
            })
            updated[monthKey] = initial
          }
          updated[monthKey] = {
            ...updated[monthKey],
            [trimmedName]: 0,
          }
        })

        return updated
      })

      setNewEmployeeName("")
      alert(`Added ${trimmedName} to ${selectedCategory} for ${selectedMonth} ${selectedYear} and all future months`)
    }
  }, [newEmployeeName, selectedCategory, payrollData, selectedMonth, selectedYear, getFutureMonthKeys])

  const removeEmployee = useCallback(
    (category, employeeName) => {
      if (
        window.confirm(
          `Are you sure you want to remove ${employeeName} from ${category}?\n\nThis will remove them from ${selectedMonth} ${selectedYear} and all future months, but preserve historical data from past months.`,
        )
      ) {
        const futureMonthKeys = getFutureMonthKeys()

        // Update payroll data for current and future months
        setMonthlyPayrollData((prev) => {
          const updated = { ...prev }

          futureMonthKeys.forEach((monthKey) => {
            if (updated[monthKey] && updated[monthKey][category]) {
              updated[monthKey] = {
                ...updated[monthKey],
                [category]: updated[monthKey][category].filter((name) => name !== employeeName),
              }
            }
          })

          return updated
        })

        // Update rendered days for current and future months
        setMonthlyRenderedDays((prev) => {
          const updated = { ...prev }

          futureMonthKeys.forEach((monthKey) => {
            if (updated[monthKey] && updated[monthKey][employeeName] !== undefined) {
              const newMonthData = { ...updated[monthKey] }
              delete newMonthData[employeeName]
              updated[monthKey] = newMonthData
            }
          })

          return updated
        })

        alert(`Removed ${employeeName} from ${category} for ${selectedMonth} ${selectedYear} and all future months`)
      }
    },
    [selectedMonth, selectedYear, getFutureMonthKeys],
  )

  const renderTimeSlot = (dateKey, timeSlot) => {
    const cellId = `${dateKey}-${timeSlot}`
    const isEditing = editingCell === cellId
    const cellData = scheduleData[dateKey]?.[timeSlot]

    if (isEditing) {
      return (
        <div className="p-1 bg-white rounded border">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCellSave(dateKey, timeSlot)
              } else if (e.key === "Escape") {
                handleCellCancel()
              }
            }}
            className="text-xs h-6"
            placeholder="Enter names"
            autoFocus
          />
          <div className="flex gap-1 mt-1">
            <Button size="sm" onClick={() => handleCellSave(dateKey, timeSlot)} className="h-5 px-1 text-xs">
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCellCancel} className="h-5 px-1 text-xs bg-transparent">
              Cancel
            </Button>
          </div>
        </div>
      )
    }

    const getTimeSlotColor = (slot) => {
      switch (slot) {
        case "8:00 AM - 4:00 PM":
          return "bg-yellow-100 border-yellow-300"
        case "4:00 PM - 12:00 AM":
          return "bg-green-100 border-green-300"
        case "12:00 AM - 8:00 AM":
          return "bg-blue-100 border-blue-300"
        case "DAY OFF":
          return "bg-red-100 border-red-300"
        default:
          return "bg-gray-100 border-gray-300"
      }
    }

    return (
      <div
        className={`p-1 mb-1 rounded border cursor-pointer hover:opacity-80 transition-opacity group relative ${getTimeSlotColor(timeSlot)}`}
        onClick={() => handleCellClick(dateKey, timeSlot)}
      >
        <div className="text-xs font-medium text-gray-600 mb-1">
          {timeSlot === "8:00 AM - 4:00 PM"
            ? "Morning"
            : timeSlot === "4:00 PM - 12:00 AM"
              ? "Evening"
              : timeSlot === "12:00 AM - 8:00 AM"
                ? "Night"
                : "Day Off"}
        </div>
        <div className="text-xs space-y-1">
          {cellData?.names?.map((name, index) => (
            <div key={`${dateKey}-${timeSlot}-${name}-${index}`} className="text-blue-700 font-medium truncate">
              {name}
            </div>
          )) || <div className="text-gray-400 italic">Click to assign</div>}
        </div>
        <Edit3 className="absolute top-1 right-1 w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-full">
      {/* Header Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex flex-col items-center gap-4 mb-6">
          {/* Logo Section - Permanent ATR & Associates CISO Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={logoUrl}
                alt="ATR & Associates CISO Logo"
                className="w-16 h-16 object-contain rounded-lg border border-gray-200 shadow-sm"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">ATRACaaS Shifting Calendar</h1>
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
          <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Export CSV
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
                        <div key={`${dayData.dateKey}-${timeSlot}`}>{renderTimeSlot(dayData.dateKey, timeSlot)}</div>
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
              <h3 className="text-xl font-bold text-gray-800">Employee Payroll Tracking</h3>
              <p className="text-sm text-gray-600 mt-1">
                Current Month: {selectedMonth} {selectedYear}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                    addEmployee()
                  }
                }}
                className="w-40"
              />

              <Button onClick={addEmployee} size="sm" className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Employee Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    Expected Number of Days (Schedule)
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Days Rendered</th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(payrollData).map(([category, employees]) => (
                  <React.Fragment key={category}>
                    <tr className="bg-yellow-200">
                      <td colSpan={4} className="border border-gray-300 px-4 py-2 font-bold text-center">
                        {category}
                      </td>
                    </tr>
                    {employees.map((employee, index) => (
                      <tr key={`${category}-${employee}-${index}`} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{employee}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center font-semibold text-blue-600">
                          {calculateExpectedDays[employee] || 0}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <Input
                            type="number"
                            min="0"
                            value={renderedDays[employee] || 0}
                            onChange={(e) => handleRenderedDaysChange(employee, e.target.value)}
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
                ))}
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
            • <strong>All data is stored in memory during your session</strong>
          </li>
          <li>• Each month/year has its own separate schedule and payroll tracking record</li>
          <li>• Switching between months preserves your data within the current session</li>
          <li>• Click on any time slot within a day to edit assignments</li>
          <li>• Enter multiple names separated by commas</li>
          <li>• Press Enter to save or Escape to cancel</li>
          <li>• Expected days are automatically calculated from calendar assignments (excluding Day Off)</li>
          <li>• Edit the "Days Rendered" column to track actual attendance</li>
          <li>• Use "Save Schedule" to download a backup JSON file of your data</li>
          <li>• Use "Export CSV" to download both schedule and payroll data as CSV</li>
          <li>
            • <strong>Note: Data will be lost when you refresh or close the browser</strong>
          </li>
        </ul>
      </div>
    </div>
  )
}

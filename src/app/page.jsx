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

  const [logoUrl, setLogoUrl] = useState(ATR_LOGO)
  const [isEditingLogo, setIsEditingLogo] = useState(false)
  const [logoInput, setLogoInput] = useState("")

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

  const handleLogoSave = useCallback(() => {
    setLogoUrl(logoInput)
    setIsEditingLogo(false)
    setLogoInput("")
  }, [logoInput])

  const handleLogoCancel = useCallback(() => {
    setIsEditingLogo(false)
    setLogoInput("")
  }, [])

  const handleLogoRemove = useCallback(() => {
    setLogoUrl("")
    setIsEditingLogo(false)
    setLogoInput("")
  }, [])

  const startEditingLogo = useCallback(() => {
    setLogoInput(logoUrl)
    setIsEditingLogo(true)
  }, [logoUrl])

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
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <div className="relative group">
                <img
                  src={logoUrl}
                  alt="ATR & Associates CISO Logo"
                  className="w-12 h-12 object-contain rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.target.style.display = "none"
                    setLogoUrl(ATR_LOGO)
                  }}
                />
                <Button
                  onClick={startEditingLogo}
                  size="sm"
                  variant="outline"
                  className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <Calendar className="w-8 h-8 text-blue-600" />
            )}
            <h1 className="text-3xl font-bold text-gray-800">ATRACaaS Shifting Calendar</h1>
          </div>

          {/* Logo Edit Section */}
          {isEditingLogo && (
            <Card className="w-full max-w-md">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-2">Logo URL:</label>
                    <Input
                      value={logoInput}
                      onChange={(e) => setLogoInput(e.target.value)}
                      placeholder="Enter image URL (e.g., https://example.com/logo.png)"
                      className="w-full"
                    />
                  </div>

                  <div className="flex gap

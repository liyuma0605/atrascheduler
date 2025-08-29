import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import React from "react";

export default function EmployeePayrollTable({
  selectedMonth,
  selectedYear,
  sortedPayrollData,
  selectedCategory,
  setSelectedCategory,
  newEmployeeName,
  setNewEmployeeName,
  onAddEmployee,
  onRemoveEmployee,
  employeeDetails,
  onEmployeeDetailChange,
  renderedDays,
  onRenderedDaysChange,
  selectedWeekForShifts,
  setSelectedWeekForShifts,
  selectedCutoffPeriod,
  setSelectedCutoffPeriod,
  weeksInMonth,
  calculateExpectedShiftsMonth,
  calculateExpectedShiftsWeek,
  calculateExpectedDaysCutoff
}) {
  return (
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
                {Object.keys(sortedPayrollData).map((category) => (
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
                  onAddEmployee();
                }
              }}
              className="w-40"
            />

            <Button
              onClick={onAddEmployee}
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
                        setSelectedWeekForShifts(Number(value))
                      }
                    >
                      <SelectTrigger className="w-20 h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: weeksInMonth }, (_, i) => (
                          <SelectItem key={i + 1} value={i + 1}>
                            Week {i + 1}
                          </SelectItem>
                        ))}
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
              {Object.entries(sortedPayrollData)
                .filter(([category]) => !['data', 'issues'].includes(category))
                .map(([category, employees]) => (
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
                              onEmployeeDetailChange(
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
                              onRenderedDaysChange(
                                employee,
                                e.target.value
                              )
                            }
                            className="w-16 h-8 text-center mx-auto"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <Button
                            onClick={() => onRemoveEmployee(category, employee)}
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
  );
}

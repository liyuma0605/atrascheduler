import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit3, X } from "lucide-react";
import { DAYS_OF_WEEK, TIME_SLOTS } from "@/utils/constants";

export default function Calendar({
  calendarDays,
  scheduleData,
  editingCell,
  editValue,
  setEditValue,
  onCellClick,
  onSaveEdit,
  onCancelEdit,
  redMarkedNames,
  onToggleNameColor,
  payrollData,
  updateCurrentMonthSchedule
}) {
  const renderTimeSlot = (dateKey, timeSlot) => {
    const cellData = scheduleData[dateKey]?.[timeSlot];
    const isEditing = editingCell?.dateKey === dateKey && editingCell?.timeSlot === timeSlot;

    if (isEditing) {
      // Get all available employees for the dropdown
      const allEmployees = Object.values(payrollData).flat();
      const currentNames = cellData?.names || [];
      
      return (
        <div className="p-1 mb-1 rounded border bg-white border-blue-400">
          <div className="text-xs font-medium text-gray-600 mb-1">
            {timeSlot}
          </div>
          
          {/* Current assigned employees */}
          <div className="mb-2">
            <div className="text-xs text-gray-500 mb-1">Currently assigned:</div>
            <div className="flex flex-wrap gap-1">
              {currentNames.map((name, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                >
                  <span>{name}</span>
                  <button
                    onClick={() => {
                      const updatedNames = currentNames.filter((_, i) => i !== index);
                      const newScheduleData = {
                        ...scheduleData,
                        [dateKey]: {
                          ...scheduleData[dateKey],
                          [timeSlot]: {
                            id: `${dateKey}-${timeSlot}`,
                            names: updatedNames,
                          },
                        },
                      };
                      updateCurrentMonthSchedule(newScheduleData);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add new employee dropdown */}
          <div className="flex gap-2">
            <Select
              onValueChange={(value) => {
                if (value && !currentNames.includes(value)) {
                  const updatedNames = [...currentNames, value];
                  const newScheduleData = {
                    ...scheduleData,
                    [dateKey]: {
                      ...scheduleData[dateKey],
                      [timeSlot]: {
                        id: `${dateKey}-${timeSlot}`,
                        names: updatedNames,
                      },
                    },
                  };
                  updateCurrentMonthSchedule(newScheduleData);
                }
              }}
            >
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder={`Add employee (${currentNames.length} assigned)`} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(payrollData).map(([category, employees]) => (
                  <div key={category}>
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                      {category}
                    </div>
                    {employees.map((employee) => (
                      <SelectItem 
                        key={employee} 
                        value={employee}
                        disabled={currentNames.includes(employee)}
                        className="pl-4"
                      >
                        {employee}
                      </SelectItem>
                    ))}
                  </div>
                ))}
                {allEmployees.length === 0 && (
                  <div className="px-2 py-2 text-xs text-gray-500 text-center">
                    No employees available
                  </div>
                )}
              </SelectContent>
            </Select>
            
            <button
              onClick={onCancelEdit}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 relative z-50"
            >
              Done
            </button>
          </div>
        </div>
      );
    }

    const getTimeSlotColor = (slot) => {
      switch (slot) {
        case "Shift 1":
          return "bg-yellow-100 border-yellow-300";
        case "Shift 2":
          return "bg-green-100 border-green-300";
        case "Shift 3":
          return "bg-blue-100 border-blue-300";
        case "Day Off":
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
        onClick={() => onCellClick(dateKey, timeSlot)}
      >
        <div className="text-xs font-medium text-gray-600 mb-1">
          {timeSlot}
        </div>
        <div className="text-xs space-y-1">
          {cellData?.names?.map((name, index) => {
            const isDayOff = timeSlot === "Day Off";
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
                    : (e) => onToggleNameColor(dateKey, timeSlot, name, e)
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
  );
}

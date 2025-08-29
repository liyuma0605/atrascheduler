import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Download, Upload, Calendar, Trash2 } from "lucide-react";
import { PERMANENT_LOGO_URL, MONTHS, YEARS } from "@/utils/constants";

export default function Header({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  onSaveSchedule,
  onExportCSV,
  onLoadBackup,
  onApplyWeeklySchedule,
  onClearSchedule
}) {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <img
            src={PERMANENT_LOGO_URL}
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
        <Button onClick={onSaveSchedule} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Schedule
        </Button>
        <Button
          onClick={onApplyWeeklySchedule}
          variant="outline"
          className="flex items-center gap-2 bg-transparent hover:bg-blue-50 border-blue-600 text-blue-600"
        >
          <Calendar className="w-4 h-4" />
          Apply Weekly Template
        </Button>
        <Button
          onClick={onClearSchedule}
          variant="outline"
          className="flex items-center gap-2 bg-transparent hover:bg-red-50 border-red-600 text-red-600"
        >
          <Trash2 className="w-4 h-4" />
          Clear Schedule
        </Button>
        <Button
          onClick={onExportCSV}
          variant="outline"
          className="flex items-center gap-2 bg-transparent hover:bg-green-50 border-green-600 text-green-600"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
        <Button
          onClick={onLoadBackup}
          variant="outline"
          className="flex items-center gap-2 bg-transparent text-orange-600 border-orange-600 hover:bg-orange-50"
        >
          <Upload className="w-4 h-4" />
          Load Backup
        </Button>
      </div>
    </div>
  );
}

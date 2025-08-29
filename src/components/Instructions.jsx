export default function Instructions() {
  return (
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
           assignments (excluding Day Off - only actual work shifts are counted)
         </li>
         <li>
           • <strong>Cutoff Periods:</strong>
           <ul className="ml-4 mt-1">
             <li>• 1st Cutoff (15th): Previous month 26th → Current month 10th</li>
             <li>• 2nd Cutoff (30th): Current month 11th → Current month 25th</li>
           </ul>
         </li>
        <li>• Edit the "Days Rendered" column to track actual attendance</li>
                 <li>• Use "Save Schedule" to create a backup export of your data</li>
         <li>• Use "Export CSV" to download both schedule and payroll data</li>
                   <li>
            •{" "}
            <strong>
              Use "Apply Weekly Template" to quickly populate the entire month with the predefined weekly schedule
            </strong>
          </li>
          <li>
            •{" "}
            <strong>
              Use "Clear Schedule" to remove all assignments from the current month (useful for starting fresh)
            </strong>
          </li>
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
  );
}

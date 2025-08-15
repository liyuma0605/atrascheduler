Skip to content
Navigation Menu
liyuma0605
atrascheduler

Type / to search
Code
Issues
Pull requests
Actions
Projects
Wiki
Security
Insights
Settings
atrascheduler/src/app
/
page.jsx
in
main

Edit

Preview
Indent mode

Spaces
Indent size

2
Line wrap mode

No wrap
Editing page.jsx file contents
1592
1593
1594
1595
1596
1597
1598
1599
1600
1601
1602
1603
1604
1605
1606
1607
1608
1609
1610
1611
1612
1613
1614
1615
1616
1617
1618
1619
1620
1621
1622
1623
1624
1625
1626
1627
1628
1629
1630
1631
1632
1633
1634
1635
1636
1637
1638
1639
1640
1641
1642
1643
1644
1645
1646
1647
1648
1649
1650
1651
1652
1653
1654
1655
1656
1657
1658
1659
1660
1661
1662
1663
1664
1665
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
            • <strong>All data is automatically saved and preserved when switching months</strong>
          </li>
          <li>• Each month/year has its own separate schedule and payroll tracking record</li>
          <li>• Returning to a previous month will restore all your data exactly as you left it</li>
          <li>• Click on any time slot within a day to edit assignments</li>
          <li>• Enter multiple names separated by commas</li>
          <li>• Press Enter to save or Escape to cancel</li>
          <li>• Expected days are automatically calculated from calendar assignments (excluding Day Off)</li>
          <li>• Edit the "Days Rendered" column to track actual attendance</li>
          <li>• Use "Save Schedule" to create a backup export of your data</li>
          <li>• Use "Export CSV" to download both schedule and payroll data</li>
          <li>
            • <strong>If data disappears after reload, click "Load Backup" to restore</strong>
          </li>
          <li>
            •{" "}
            <strong>
              Employee Payroll Tracking table now displays in alphabetical order by category and employee name
            </strong>
          </li>
        </ul>
      </div>
    </div>
  )
}

Use Control + Shift + m to toggle the tab key moving focus. Alternatively, use esc then tab to move to the next interactive element on the page.
Editing atrascheduler/src/app/page.jsx at main · liyuma0605/atrascheduler 

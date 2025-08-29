import { useState, useEffect, useCallback } from "react";
import { INITIAL_PAYROLL_DATA } from "@/utils/constants";
import { createInitialCalendarData } from "@/utils/helpers";
import { firebaseService } from "@/lib/firebaseService";

export function useDataManagement() {
  const [monthlyScheduleData, setMonthlyScheduleData] = useState({});
  const [monthlyPayrollData, setMonthlyPayrollData] = useState({});
  const [monthlyRenderedDays, setMonthlyRenderedDays] = useState({});
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to remove duplicates from payroll data
  const removeDuplicates = useCallback((payrollData) => {
    if (!payrollData) return payrollData;
    
    const cleaned = {};
    Object.entries(payrollData).forEach(([category, employees]) => {
      if (Array.isArray(employees)) {
        const uniqueEmployees = employees.filter((employee, index, arr) => 
          arr.indexOf(employee) === index
        );
        cleaned[category] = uniqueEmployees;
      } else {
        cleaned[category] = employees;
      }
    });
    return cleaned;
  }, []);

  // Load all saved data from Firebase
  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("🔄 Starting Firebase data load process...");

      // Load all available months
      const allMonths = await firebaseService.loadAllMonths();
      console.log("📅 Found months:", allMonths);

      // Load data for each month
      const scheduleData = {};
      const payrollData = {};
      const renderedDays = {};

      for (const monthKey of allMonths) {
        try {
          const monthData = await firebaseService.loadMonthData(monthKey);
          
          if (monthData.scheduleData) {
            scheduleData[monthKey] = monthData.scheduleData;
          }
          
          if (monthData.payrollData) {
            const cleanedPayroll = removeDuplicates(monthData.payrollData);
            payrollData[monthKey] = cleanedPayroll;
            
            // Save cleaned data back to Firebase
            await firebaseService.savePayrollData(monthKey, cleanedPayroll);
          }
          
          if (monthData.renderedDays) {
            renderedDays[monthKey] = monthData.renderedDays;
          }
        } catch (monthError) {
          console.warn(`⚠️ Error loading data for month ${monthKey}:`, monthError);
        }
      }

      // Load employee details
      const employeeDetails = await firebaseService.loadEmployeeDetails() || {};

      // Set all data
      setMonthlyScheduleData(scheduleData);
      setMonthlyPayrollData(payrollData);
      setMonthlyRenderedDays(renderedDays);
      setEmployeeDetails(employeeDetails);

      console.log("✅ Firebase data load completed:", {
        scheduleMonths: Object.keys(scheduleData).length,
        payrollMonths: Object.keys(payrollData).length,
        renderedMonths: Object.keys(renderedDays).length,
        employees: Object.keys(employeeDetails).length
      });

    } catch (error) {
      console.error("❌ Error loading Firebase data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
      setIsDataLoaded(true);
    }
  }, [removeDuplicates]);

  // Initialize data on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Auto-save functions with debouncing
  const debouncedSave = useCallback((saveFunction, delay = 1000) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => saveFunction(...args), delay);
    };
  }, []);

  // Auto-save schedule data
  const saveScheduleData = useCallback(async (data) => {
    try {
      for (const [monthKey, scheduleData] of Object.entries(data)) {
        await firebaseService.saveScheduleData(monthKey, scheduleData);
      }
      console.log("✅ Auto-saved schedule data to Firebase");
    } catch (error) {
      console.error("❌ Error saving schedule data to Firebase:", error);
      setError(error.message);
    }
  }, []);

  const debouncedSaveSchedule = useCallback(
    debouncedSave(saveScheduleData, 2000),
    [saveScheduleData, debouncedSave]
  );

  useEffect(() => {
    if (!isDataLoaded || Object.keys(monthlyScheduleData).length === 0) return;
    debouncedSaveSchedule(monthlyScheduleData);
  }, [monthlyScheduleData, isDataLoaded, debouncedSaveSchedule]);

  // Auto-save payroll data
  const savePayrollData = useCallback(async (data) => {
    try {
      for (const [monthKey, payrollData] of Object.entries(data)) {
        await firebaseService.savePayrollData(monthKey, payrollData);
      }
      console.log("✅ Auto-saved payroll data to Firebase");
    } catch (error) {
      console.error("❌ Error saving payroll data to Firebase:", error);
      setError(error.message);
    }
  }, []);

  const debouncedSavePayroll = useCallback(
    debouncedSave(savePayrollData, 2000),
    [savePayrollData, debouncedSave]
  );

  useEffect(() => {
    if (!isDataLoaded || Object.keys(monthlyPayrollData).length === 0) return;
    debouncedSavePayroll(monthlyPayrollData);
  }, [monthlyPayrollData, isDataLoaded, debouncedSavePayroll]);

  // Auto-save rendered days
  const saveRenderedDays = useCallback(async (data) => {
    try {
      for (const [monthKey, renderedDays] of Object.entries(data)) {
        await firebaseService.saveRenderedDays(monthKey, renderedDays);
      }
      console.log("✅ Auto-saved rendered days to Firebase");
    } catch (error) {
      console.error("❌ Error saving rendered days to Firebase:", error);
      setError(error.message);
    }
  }, []);

  const debouncedSaveRendered = useCallback(
    debouncedSave(saveRenderedDays, 2000),
    [saveRenderedDays, debouncedSave]
  );

  useEffect(() => {
    if (!isDataLoaded || Object.keys(monthlyRenderedDays).length === 0) return;
    debouncedSaveRendered(monthlyRenderedDays);
  }, [monthlyRenderedDays, isDataLoaded, debouncedSaveRendered]);

  // Auto-save employee details
  const saveEmployeeDetails = useCallback(async (data) => {
    try {
      await firebaseService.saveEmployeeDetails(data);
      console.log("✅ Auto-saved employee details to Firebase");
    } catch (error) {
      console.error("❌ Error saving employee details to Firebase:", error);
      setError(error.message);
    }
  }, []);

  const debouncedSaveEmployeeDetails = useCallback(
    debouncedSave(saveEmployeeDetails, 2000),
    [saveEmployeeDetails, debouncedSave]
  );

  useEffect(() => {
    if (!isDataLoaded || Object.keys(employeeDetails).length === 0) return;
    debouncedSaveEmployeeDetails(employeeDetails);
  }, [employeeDetails, isDataLoaded, debouncedSaveEmployeeDetails]);

  // Manual save functions for immediate saves
  const saveCurrentMonthData = useCallback(async (monthKey) => {
    try {
      await Promise.all([
        firebaseService.saveScheduleData(monthKey, monthlyScheduleData[monthKey] || {}),
        firebaseService.savePayrollData(monthKey, monthlyPayrollData[monthKey] || {}),
        firebaseService.saveRenderedDays(monthKey, monthlyRenderedDays[monthKey] || {})
      ]);
      console.log(`✅ Manually saved data for ${monthKey}`);
    } catch (error) {
      console.error(`❌ Error manually saving data for ${monthKey}:`, error);
      setError(error.message);
    }
  }, [monthlyScheduleData, monthlyPayrollData, monthlyRenderedDays]);

  // Backup and restore functions
  const createBackup = useCallback(async (monthKey) => {
    try {
      const backupKey = await firebaseService.createBackup(monthKey);
      console.log(`✅ Backup created: ${backupKey}`);
      return backupKey;
    } catch (error) {
      console.error("❌ Error creating backup:", error);
      setError(error.message);
      throw error;
    }
  }, []);

  const restoreBackup = useCallback(async (backupKey) => {
    try {
      const monthKey = await firebaseService.restoreBackup(backupKey);
      console.log(`✅ Backup restored: ${backupKey}`);
      
      // Reload data after restore
      await loadAllData();
      
      return monthKey;
    } catch (error) {
      console.error("❌ Error restoring backup:", error);
      setError(error.message);
      throw error;
    }
  }, [loadAllData]);

  // Real-time synchronization (optional - can be enabled if needed)
  const enableRealTimeSync = useCallback((monthKey) => {
    return firebaseService.subscribeToDataChanges(monthKey, (dataType, data) => {
      console.log(`🔄 Real-time update for ${dataType}:`, data);
      
      switch (dataType) {
        case 'scheduleData':
          setMonthlyScheduleData(prev => ({ ...prev, [monthKey]: data }));
          break;
        case 'payrollData':
          setMonthlyPayrollData(prev => ({ ...prev, [monthKey]: data }));
          break;
        case 'renderedDays':
          setMonthlyRenderedDays(prev => ({ ...prev, [monthKey]: data }));
          break;
      }
    });
  }, []);

  return {
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
    saveCurrentMonthData,
    createBackup,
    restoreBackup,
    enableRealTimeSync,
  };
}

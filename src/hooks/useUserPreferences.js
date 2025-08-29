import { useState, useEffect, useCallback } from "react";
import { firebaseService } from "@/lib/firebaseService";
import { MONTHS } from "@/utils/constants";

export function useUserPreferences() {
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [redMarkedNames, setRedMarkedNames] = useState({});
  const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false);

  // Load user preferences from Firebase
  const loadPreferences = useCallback(async () => {
    try {
      console.log("🔄 Loading user preferences from Firebase...");
      
      const preferences = await firebaseService.loadUserPreferences();
      
      if (preferences) {
        setSelectedMonth(preferences.selectedMonth || MONTHS[new Date().getMonth()]);
        setSelectedYear(preferences.selectedYear || new Date().getFullYear().toString());
        setRedMarkedNames(preferences.redMarkedNames || {});
      }
      
      console.log("✅ User preferences loaded from Firebase");
    } catch (error) {
      console.error("❌ Error loading user preferences:", error);
      // Fallback to default values
      setSelectedMonth(MONTHS[new Date().getMonth()]);
      setSelectedYear(new Date().getFullYear().toString());
      setRedMarkedNames({});
    } finally {
      setIsPreferencesLoaded(true);
    }
  }, []);

  // Save user preferences to Firebase
  const savePreferences = useCallback(async (preferences) => {
    try {
      await firebaseService.saveUserPreferences(preferences);
      console.log("✅ User preferences saved to Firebase");
    } catch (error) {
      console.error("❌ Error saving user preferences:", error);
    }
  }, []);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Auto-save selected month
  useEffect(() => {
    if (!isPreferencesLoaded) return;
    
    savePreferences({
      selectedMonth,
      selectedYear,
      redMarkedNames
    });
  }, [selectedMonth, selectedYear, redMarkedNames, isPreferencesLoaded, savePreferences]);

  // Update functions
  const updateSelectedMonth = useCallback((month) => {
    setSelectedMonth(month);
  }, []);

  const updateSelectedYear = useCallback((year) => {
    setSelectedYear(year);
  }, []);

  const updateRedMarkedNames = useCallback((names) => {
    setRedMarkedNames(names);
  }, []);

  return {
    selectedMonth,
    selectedYear,
    redMarkedNames,
    isPreferencesLoaded,
    updateSelectedMonth,
    updateSelectedYear,
    updateRedMarkedNames,
    loadPreferences,
  };
}

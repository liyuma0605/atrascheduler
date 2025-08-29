import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names
const COLLECTIONS = {
  SCHEDULE_DATA: 'scheduleData',
  PAYROLL_DATA: 'payrollData',
  RENDERED_DAYS: 'renderedDays',
  EMPLOYEE_DETAILS: 'employeeDetails',
  USER_PREFERENCES: 'userPreferences'
};

class FirebaseService {
  // Generic save method
  async saveData(collectionName, documentId, data) {
    try {
      const docRef = doc(db, collectionName, documentId);
      await setDoc(docRef, data, { merge: true });
      console.log(`✅ Data saved to ${collectionName}/${documentId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error saving data to ${collectionName}/${documentId}:`, error);
      throw error;
    }
  }

  // Generic load method
  async loadData(collectionName, documentId) {
    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log(`✅ Data loaded from ${collectionName}/${documentId}`);
        return docSnap.data();
      } else {
        console.log(`📄 No data found at ${collectionName}/${documentId}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error loading data from ${collectionName}/${documentId}:`, error);
      throw error;
    }
  }

  // Schedule Data Methods
  async saveScheduleData(monthKey, scheduleData) {
    return this.saveData(COLLECTIONS.SCHEDULE_DATA, monthKey, { data: scheduleData });
  }

  async loadScheduleData(monthKey) {
    const result = await this.loadData(COLLECTIONS.SCHEDULE_DATA, monthKey);
    return result ? result.data : null;
  }

  // Payroll Data Methods
  async savePayrollData(monthKey, payrollData) {
    return this.saveData(COLLECTIONS.PAYROLL_DATA, monthKey, { data: payrollData });
  }

  async loadPayrollData(monthKey) {
    const result = await this.loadData(COLLECTIONS.PAYROLL_DATA, monthKey);
    return result ? result.data : null;
  }

  // Rendered Days Methods
  async saveRenderedDays(monthKey, renderedDays) {
    return this.saveData(COLLECTIONS.RENDERED_DAYS, monthKey, { data: renderedDays });
  }

  async loadRenderedDays(monthKey) {
    const result = await this.loadData(COLLECTIONS.RENDERED_DAYS, monthKey);
    return result ? result.data : null;
  }

  // Employee Details Methods
  async saveEmployeeDetails(employeeDetails) {
    return this.saveData(COLLECTIONS.EMPLOYEE_DETAILS, 'all', { data: employeeDetails });
  }

  async loadEmployeeDetails() {
    const result = await this.loadData(COLLECTIONS.EMPLOYEE_DETAILS, 'all');
    return result ? result.data : null;
  }

  // User Preferences Methods
  async saveUserPreferences(preferences) {
    return this.saveData(COLLECTIONS.USER_PREFERENCES, 'default', preferences);
  }

  async loadUserPreferences() {
    return this.loadData(COLLECTIONS.USER_PREFERENCES, 'default');
  }

  // Load all data for a specific month
  async loadMonthData(monthKey) {
    try {
      const [scheduleData, payrollData, renderedDays] = await Promise.all([
        this.loadScheduleData(monthKey),
        this.loadPayrollData(monthKey),
        this.loadRenderedDays(monthKey)
      ]);

      return {
        scheduleData,
        payrollData,
        renderedDays
      };
    } catch (error) {
      console.error(`❌ Error loading month data for ${monthKey}:`, error);
      throw error;
    }
  }

  // Load all available months
  async loadAllMonths() {
    try {
      const collections = [COLLECTIONS.SCHEDULE_DATA, COLLECTIONS.PAYROLL_DATA, COLLECTIONS.RENDERED_DAYS];
      const allMonths = new Set();

      for (const collectionName of collections) {
        const q = query(collection(db, collectionName));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          allMonths.add(doc.id);
        });
      }

      return Array.from(allMonths);
    } catch (error) {
      console.error('❌ Error loading all months:', error);
      throw error;
    }
  }

  // Real-time listener for data changes
  subscribeToDataChanges(monthKey, callback) {
    const unsubscribeFunctions = [];

    // Subscribe to schedule data changes
    const scheduleUnsubscribe = onSnapshot(
      doc(db, COLLECTIONS.SCHEDULE_DATA, monthKey),
      (doc) => {
        if (doc.exists()) {
          callback('scheduleData', doc.data().data);
        }
      }
    );

    // Subscribe to payroll data changes
    const payrollUnsubscribe = onSnapshot(
      doc(db, COLLECTIONS.PAYROLL_DATA, monthKey),
      (doc) => {
        if (doc.exists()) {
          callback('payrollData', doc.data().data);
        }
      }
    );

    // Subscribe to rendered days changes
    const renderedUnsubscribe = onSnapshot(
      doc(db, COLLECTIONS.RENDERED_DAYS, monthKey),
      (doc) => {
        if (doc.exists()) {
          callback('renderedDays', doc.data().data);
        }
      }
    );

    unsubscribeFunctions.push(scheduleUnsubscribe, payrollUnsubscribe, renderedUnsubscribe);

    // Return unsubscribe function
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }

  // Enhanced backup system using Firebase
  async createCompleteBackup() {
    try {
      const backupKey = `complete_backup_${Date.now()}`;
      const allMonths = await this.loadAllMonths();
      
      const backupData = {
        timestamp: Date.now(),
        months: allMonths,
        data: {}
      };

      // Collect all data for each month
      for (const monthKey of allMonths) {
        const monthData = await this.loadMonthData(monthKey);
        backupData.data[monthKey] = monthData;
      }

      // Add employee details
      backupData.employeeDetails = await this.loadEmployeeDetails();
      
      // Add user preferences
      backupData.userPreferences = await this.loadUserPreferences();

      await this.saveData('backups', backupKey, backupData);
      
      console.log(`✅ Complete backup created: ${backupKey}`);
      return backupKey;
    } catch (error) {
      console.error('❌ Error creating complete backup:', error);
      throw error;
    }
  }

  async loadCompleteBackup(backupKey) {
    try {
      const backup = await this.loadData('backups', backupKey);
      if (!backup) {
        throw new Error('Backup not found');
      }

      // Restore all month data
      for (const [monthKey, monthData] of Object.entries(backup.data)) {
        if (monthData.scheduleData) {
          await this.saveScheduleData(monthKey, monthData.scheduleData);
        }
        if (monthData.payrollData) {
          await this.savePayrollData(monthKey, monthData.payrollData);
        }
        if (monthData.renderedDays) {
          await this.saveRenderedDays(monthKey, monthData.renderedDays);
        }
      }

      // Restore employee details
      if (backup.employeeDetails) {
        await this.saveEmployeeDetails(backup.employeeDetails);
      }

      // Restore user preferences
      if (backup.userPreferences) {
        await this.saveUserPreferences(backup.userPreferences);
      }

      console.log(`✅ Complete backup restored: ${backupKey}`);
      return backup;
    } catch (error) {
      console.error('❌ Error restoring complete backup:', error);
      throw error;
    }
  }

  // Get all available backups
  async getAllBackups() {
    try {
      const q = query(collection(db, 'backups'));
      const querySnapshot = await getDocs(q);
      const backups = [];
      
      querySnapshot.forEach((doc) => {
        backups.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return backups.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('❌ Error loading backups:', error);
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;

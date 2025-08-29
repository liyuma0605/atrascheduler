// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6clvLELFJ0VSaROp_1Hunyx7lmngpVBo",
  authDomain: "gad-repo-58f8f.firebaseapp.com",
  projectId: "gad-repo-58f8f",
  storageBucket: "gad-repo-58f8f.firebasestorage.app",
  messagingSenderId: "406833837911",
  appId: "1:406833837911:web:741abdfd7d734944897012"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
export default app;
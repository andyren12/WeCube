// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAXNot8lRkBopzkeWUYXgMSYiEeTCQ-C9M",
  authDomain: "wecube-ef14f.firebaseapp.com",
  projectId: "wecube-ef14f",
  storageBucket: "wecube-ef14f.firebasestorage.app",
  messagingSenderId: "670331214677",
  appId: "1:670331214677:web:b3d38a8ca8e715bb122ddc",
  measurementId: "G-ZT1DRCSFPC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

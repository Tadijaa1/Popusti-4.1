import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7PdXEdcufuUtFEHqGKwYnA7v4zy1toxA",
  authDomain: "popusti-9db1a.firebaseapp.com",
  projectId: "popusti-9db1a",
  storageBucket: "popusti-9db1a.firebasestorage.app",
  messagingSenderId: "217123418288",
  appId: "1:217123418288:web:3d30d5cd3da03ae1220b75",
  measurementId: "G-QCKJTKRJS1",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
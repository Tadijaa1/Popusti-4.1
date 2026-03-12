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

// Funkcije za čuvanje proizvoda
import { doc, setDoc, deleteDoc, getDoc, collection, getDocs, query, where } from "firebase/firestore";

export const saveProduct = async (userId, product) => {
  const savedRef = doc(db, "users", userId, "savedProducts", product.id);
  await setDoc(savedRef, {
    ...product,
    savedAt: new Date().toISOString()
  });
};

export const unsaveProduct = async (userId, productId) => {
  const savedRef = doc(db, "users", userId, "savedProducts", productId);
  await deleteDoc(savedRef);
};

export const getSavedProducts = async (userId) => {
  const savedRef = collection(db, "users", userId, "savedProducts");
  const snapshot = await getDocs(savedRef);
  const products = [];
  snapshot.forEach(doc => {
    products.push({ id: doc.id, ...doc.data() });
  });
  return products;
};

export const isProductSaved = async (userId, productId) => {
  const savedRef = doc(db, "users", userId, "savedProducts", productId);
  const docSnap = await getDoc(savedRef);
  return docSnap.exists();
};
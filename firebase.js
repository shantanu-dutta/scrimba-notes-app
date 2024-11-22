import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMk-DoJRJT8rz3ObdfobPd5ayGI2ZRvj8",
  authDomain: "react-notes-12dde.firebaseapp.com",
  projectId: "react-notes-12dde",
  storageBucket: "react-notes-12dde.firebasestorage.app",
  messagingSenderId: "719966000918",
  appId: "1:719966000918:web:12c2df4f38b1a70eeee237"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
export const notesCollection = collection(db, "notes")

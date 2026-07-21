import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA324kfL3KOnz3DWtDIJ71tS8Vtn9gPUh0",
  authDomain: "bootwo-f3ea4.firebaseapp.com",
  projectId: "bootwo-f3ea4",
  storageBucket: "bootwo-f3ea4.firebasestorage.app",
  messagingSenderId: "608555122608",
  appId: "1:608555122608:web:0ccdaf919366334927e075",
  measurementId: "G-9ETRYVR1XS"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

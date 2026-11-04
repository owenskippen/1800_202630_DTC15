import { auth, db } from "./firebase.js";
import { addDoc, collection, getDocs } from "firebase/firestore";

const form = document.getElementById("report-Form");
const message = document.getElementById("report-status");

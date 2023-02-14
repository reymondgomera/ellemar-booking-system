import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
   apiKey: 'AIzaSyCPkvZyLfAAkQuJ2_840lW-EWLJ9A8eg68',
   authDomain: 'ellemar-booking-system.firebaseapp.com',
   projectId: 'ellemar-booking-system',
   storageBucket: 'ellemar-booking-system.appspot.com',
   messagingSenderId: '614314983707',
   appId: '1:614314983707:web:ba5cebe07fa548930653be',
   measurementId: 'G-5JQLHDZQ0N',
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const auth = getAuth(firebaseApp);

export { db, storage, auth, firebaseConfig };

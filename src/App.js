import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from './components/LandingPage';
import Contact from './components/Contact';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import StaffDashboard from './components/StaffDashboard';
import { useEffect, useState } from 'react';

import { db, auth } from './firebase';
import { getDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Rooms from './components/Rooms';
import Booking from './components/Booking';

function App() {
   const [user, setUser] = useState(null);
   const [role, setRole] = useState('');

   const checkAuthorization = async uid => {
      const docRef = doc(db, 'users', uid);
      try {
         const userDocument = await getDoc(docRef);
         if (userDocument.exists) {
            const { role, status } = userDocument.data();
            return { role, status };
         } else console.log('No such document!');
      } catch (err) {
         console.error(err);
      }
   };

   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async userCredential => {
         if (userCredential) {
            const { uid } = userCredential;
            const { role, status } = await checkAuthorization(uid);

            if (role === 'admin' || role === 'staff') {
               if (status === 'active') {
                  setUser(userCredential);
                  setRole(role);
               } else {
                  signOut(auth);
               }
            }
         }
      });

      // perform clean up
      return () => {
         unsubscribe();
      };
   }, []);

   return (
      <>
         <Router>
            <Routes>
               <Route path='/' element={<LandingPage />} />
               <Route path='/contact' element={<Contact />} />
               <Route path='/rooms' element={<Rooms />} />
               <Route path='/booking/:roomId' element={<Booking />} />
               <Route
                  path='/login'
                  element={
                     !user && !role ? (
                        <Login onCheckAuthorization={checkAuthorization} onSetRole={setRole} onSetUser={setUser} />
                     ) : user && role === 'admin' ? (
                        <Navigate replace to='/admin' />
                     ) : (
                        user && role === 'staff' && <Navigate replace to='/staff' />
                     )
                  }
               />
               <Route
                  path='/admin'
                  element={
                     user && role === 'admin' ? (
                        <AdminDashboard user={user} onSetRole={setRole} onSetUser={setUser} />
                     ) : (
                        !user && !role && <Navigate replace to='/login' />
                     )
                  }
               />
               <Route
                  path='/staff'
                  element={
                     user && role === 'staff' ? (
                        <StaffDashboard user={user} onSetRole={setRole} onSetUser={setUser} />
                     ) : (
                        !user && !role && <Navigate replace to='/login' />
                     )
                  }
               />
            </Routes>
         </Router>
         <ToastContainer autoClose='2500' theme='light' style={{ fontSize: '1rem', width: '350px' }} />
      </>
   );
}

export default App;

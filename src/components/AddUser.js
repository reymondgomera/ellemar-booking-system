import { initializeApp } from 'firebase/app';
import { useRef, useState } from 'react';
import { RiKeyFill } from 'react-icons/ri';
import { FaUserAlt } from 'react-icons/fa';
import Modal from './Modal';
import { RiErrorWarningLine } from 'react-icons/ri';
import { toast } from 'react-toastify';

import { db, firebaseConfig } from '../firebase';
import { createUserWithEmailAndPassword, signOut, getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const AddUser = () => {
   const [inputs, setInputs] = useState({ email: '', password: '' });
   const formRef = useRef(null);

   const { email, password } = inputs;

   const handleInputChange = e => {
      setInputs({ ...inputs, [e.target.name]: e.target.value });
   };

   const handleSubmit = () => {
      formRef.current.className += ' was-validated';

      // create secodary intance of app and auth
      const secondaryApp = initializeApp(firebaseConfig, 'SECONDARY');
      const secondaryAuth = getAuth(secondaryApp);

      if (email && password) {
         createUserWithEmailAndPassword(secondaryAuth, email, password)
            .then(userCredential => {
               // Upon successully create, we can access created user
               const { uid, email } = userCredential.user;
               const docRef = doc(db, 'users', uid);

               // creae user to document to firestore using user credentials
               setDoc(docRef, {
                  email,
                  password,
                  role: 'staff',
                  status: 'active',
               })
                  .then(async () => {
                     formRef.current.classList.remove('was-validated');
                     setInputs({ email: '', password: '' });
                     toast.success('User added successfully.');

                     // signout user to avoid automatically signin
                     return await signOut(secondaryAuth);
                  })
                  .catch(err => toast.error(err.message));
            })
            .catch(err => {
               formRef.current.classList.remove('was-validated');

               switch (err.code) {
                  case 'auth/invalid-email':
                     toast.error('Invalid email.');
                     break;
                  case 'auth/weak-password':
                     toast.error('Password should be at least 6 characters.');
                     break;
                  case 'auth/email-already-in-use':
                     toast.error('Email already in use.');
               }
            });
      } else {
         toast.error('Please complete all required fields.');
      }
   };

   return (
      <div className='mx-4 my-5 px-5 py-4'>
         <form ref={formRef} className='needs-validation d-flex flex-column' noValidate onSubmit={handleSubmit}>
            <div className='input-container mb-3'>
               <FaUserAlt className='text-dark fs-5' />
               <input
                  value={email}
                  type='email'
                  className='form-control form-control-group-style rounded-style'
                  id='email'
                  name='email'
                  placeholder='Email'
                  required
                  onChange={handleInputChange}
               />
               {!email && <div className='invalid-feedback py-1 px-1'>Email can't be empty</div>}
            </div>
            <div className='input-container mb-4'>
               <RiKeyFill className='text-dark fs-4' />
               <input
                  value={password}
                  type='password'
                  className='form-control form-control-group-style rounded-style'
                  id='password'
                  name='password'
                  placeholder='Password'
                  required
                  onChange={handleInputChange}
               />
               <div className='invalid-feedback py-1 px-1'>Password can't be empty.</div>
            </div>
            <button
               className='btn btn-primary align-self-end py-2 px-4 rounded-style'
               type='button'
               data-bs-toggle='modal'
               data-bs-target='#addUser-confirm-modal'
            >
               Add
            </button>
         </form>

         <Modal target='addUser-confirm-modal'>
            <div className='d-flex flex-column justify-content-center mt-5 mb-2 mx-3'>
               <div>
                  <RiErrorWarningLine className='text-danger warning-icon me-2' />
                  Are you sure you're going to add this user?
               </div>
               <div className='mt-5 align-self-end'>
                  <button className='btn btn-secondary py-2 px-4 rounded-style me-3' data-bs-dismiss='modal'>
                     Cancel
                  </button>
                  <button className='btn btn-primary py-2 px-4 rounded-style' data-bs-dismiss='modal' onClick={handleSubmit}>
                     Confirm
                  </button>
               </div>
            </div>
         </Modal>
      </div>
   );
};

export default AddUser;

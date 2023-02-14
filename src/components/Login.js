import { FaUserAlt } from 'react-icons/fa';
import { RiKeyFill } from 'react-icons/ri';
import login from '../assets/images/login.svg';
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';

import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';

const Login = ({ onCheckAuthorization, onSetRole, onSetUser }) => {
   const [inputs, setInputs] = useState({ email: '', password: '' });
   const formRef = useRef(null);

   const { email, password } = inputs;

   const handleInputChange = e => {
      setInputs({ ...inputs, [e.target.name]: e.target.value });
   };

   const handleSubmit = e => {
      e.preventDefault();
      e.target.className += ' was-validated';

      if (email && password) {
         signInWithEmailAndPassword(auth, email, password)
            .then(async userCredential => {
               const { uid } = userCredential.user;
               const { role, status } = await onCheckAuthorization(uid);

               if (role === 'admin' || role === 'staff') {
                  if (status === 'active') {
                     e.target.classList.remove('was-validated');
                     toast.success('Login successfully!');
                     onSetUser(userCredential.user);
                     onSetRole(role);
                  } else {
                     signOut(auth);
                     e.target.classList.remove('was-validated');
                     return toast.error('User not authorized.');
                  }
               }
            })
            .catch(err => {
               switch (err.code) {
                  case 'auth/invalid-email':
                     toast.error('Invalid email.');
                     break;
                  case 'auth/wrong-password':
                     toast.error('Password incorrect.');
                     break;
                  case 'auth/user-not-found':
                     toast.error("User doesn't exist.");
               }
            });
      } else {
         toast.error('Please complete all required fields.');
      }
   };

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

   return (
      <div className='row g-0 align-items-center'>
         <div className='col g-0'>
            <div className='login-left d-flex flex-column justify-content-center '>
               <h1 className='h2 text-center mb-5'>Login</h1>
               <form className='needs-validation d-flex flex-column' noValidate onSubmit={handleSubmit}>
                  <div className='input-container mb-3'>
                     <FaUserAlt className='text-dark fs-5' />
                     <input
                        type='email'
                        className='form-control form-control-group-style rounded-style'
                        id='email'
                        name='email'
                        required
                        placeholder='Email'
                        onChange={handleInputChange}
                     />
                     {!email && <div className='invalid-feedback py-1 px-1'>Email can't be empty</div>}
                  </div>
                  <div className='input-container mb-4'>
                     <RiKeyFill className='text-dark fs-4' />
                     <input
                        type='password'
                        className='form-control form-control-group-style rounded-style'
                        id='password'
                        name='password'
                        required
                        placeholder='Password'
                        onChange={handleInputChange}
                     />
                     <div className='invalid-feedback py-1 px-1'>Password can't be empty.</div>
                  </div>
                  <button className='btn btn-primary align-self-end py-2 px-4 rounded-style' type='submit'>
                     Login
                  </button>
               </form>
            </div>
         </div>
         <div className='d-none d-lg-block col-6 g-0 '>
            <div className='login-right d-flex align-items-end'>
               <h2 className='image-text text-white'>Authenticate User</h2>
               <img className='img-fluid login-image' src={login} alt='login.' />
            </div>
         </div>
      </div>
   );
};

export default Login;

import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const AdminDashboardHeader = ({ user, onSetRole, onSetUser }) => {
   const signout = () => {
      onSetRole('');
      onSetUser(null);
      signOut(auth).then(() => toast.success('Logout successfully.'));
   };
   return (
      <nav className='navbar navbar-expand-lg navbar-style p-3'>
         <div className='container px-0'>
            <Link className='navbar-brand text-reset fs-4 fw-bold' to='/'>
               El'lemar
            </Link>
            <NavLink
               className={({ isActive }) =>
                  isActive ? 'ms-5 d-none d-lg-block nav-link nav-link-style active' : 'ms-5 d-none d-lg-block nav-link nav-link-style'
               }
               to='/admin'
            >
               Dashboard
            </NavLink>
            <button className='navbar-toggler' type='button' data-bs-toggle='collapse' data-bs-target='#navbarSupportedContent'>
               <span className='navbar-toggler-icon'></span>
            </button>
            <div className='collapse navbar-collapse' id='navbarSupportedContent'>
               <ul className='navbar-nav ms-auto mb-2 mb-lg-0'>
                  <li className='nav-item px-lg-4'>
                     <NavLink
                        className={({ isActive }) =>
                           isActive ? 'd-block  d-lg-none nav-link nav-link-style active' : 'd-block d-lg-none nav-link nav-link-style'
                        }
                        to='/admin'
                     >
                        Dashboard
                     </NavLink>
                  </li>
                  {!user ? (
                     <li className='nav-item ps-lg-4'>
                        <Link className='btn btn-primary py-2 px-4 mt-2 mt-lg-0 nav-link nav-link-style rounded-style' to='/login'>
                           Login
                        </Link>
                     </li>
                  ) : (
                     <li className='nav-item ps-lg-4'>
                        <button className='btn btn-primary py-2 px-4 mt-2 mt-lg-0 nav-link nav-link-style rounded-style' onClick={signout}>
                           Logout
                        </button>
                     </li>
                  )}
               </ul>
            </div>
         </div>
      </nav>
   );
};

export default AdminDashboardHeader;

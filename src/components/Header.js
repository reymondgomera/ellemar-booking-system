import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Header = () => {
   return (
      <nav className='navbar navbar-expand-lg navbar-style p-3'>
         <div className='container px-0'>
            <Link className='navbar-brand text-reset fs-4 fw-bold' to='/'>
               El'lemar
            </Link>
            <button className='navbar-toggler' type='button' data-bs-toggle='collapse' data-bs-target='#navbarSupportedContent'>
               <span className='navbar-toggler-icon'></span>
            </button>
            <div className='collapse navbar-collapse' id='navbarSupportedContent'>
               <ul className='navbar-nav ms-auto mb-2 mb-lg-0'>
                  {/* to be with navigation link from react-router-dom*/}
                  <li className='nav-item px-lg-4'>
                     <NavLink className={({ isActive }) => (isActive ? 'nav-link nav-link-style active' : 'nav-link nav-link-style')} to='/'>
                        Home
                     </NavLink>
                  </li>
                  <li className='nav-item px-lg-4'>
                     <NavLink className={({ isActive }) => (isActive ? 'nav-link nav-link-style active' : 'nav-link nav-link-style')} to='/rooms'>
                        Rooms
                     </NavLink>
                  </li>
                  <li className='nav-item px-lg-4'>
                     <NavLink className={({ isActive }) => (isActive ? 'nav-link nav-link-style active' : 'nav-link nav-link-style')} to='/contact'>
                        Contact
                     </NavLink>
                  </li>
                  <li className='nav-item ps-lg-4'>
                     <Link className='btn btn-primary py-2 px-4 mt-2 mt-lg-0 nav-link nav-link-style rounded-style' to='/login'>
                        Login
                     </Link>
                  </li>
               </ul>
            </div>
         </div>
      </nav>
   );
};

export default Header;

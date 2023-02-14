import React from 'react';
import Footer from './Footer';
import Header from './Header';
import { Link } from 'react-router-dom';

import { BsArrowRight } from 'react-icons/bs';

import beach from '../assets/images/beach.svg';
import surfer from '../assets/images/surfer.svg';

const LandingPage = () => {
   return (
      <>
         <Header />
         <div className='container'>
            <section className='d-flex my-5 p-3 p-lg-0 justify-content-between align-items-center'>
               <div className='mb-lg-0 me-lg-5'>
                  <div>
                     <h1 className='fs-2'>
                        Beautiful place to <span className='h1 fs-2 text-primary'>spend your time together</span>
                     </h1>
                     <p className='d-block my-4 banner-paragraph'>
                        Enjoy the sunny beach in El'lemar Beach38. Situated in the shores of Davao Occidental book now and find comfort in our place.
                     </p>
                  </div>
                  <div>
                     <Link className='btn btn-primary btn-lg fw-bold rounded-style' to='/rooms'>
                        Book Now <BsArrowRight className='ms-2 fs-5' />
                     </Link>
                  </div>
               </div>
               <div className='d-none d-lg-block mb-4'>
                  <img className='mb-lg-0' src={surfer} alt='surfer.jpg' width='500' />
               </div>
            </section>
         </div>

         <div className='bg-primary '>
            <div className='container'>
               <section className='d-flex flex-column flex-lg-row my-5 p-3 p-lg-0 justify-content-between align-items-center'>
                  <div className='d-none d-lg-block bg-white order-2 order-lg-0 mb-4 me-lg-5'>
                     <img className='mb-lg-0' src={beach} alt='beach.jpg' width='500' />
                  </div>

                  <div className='mb-lg-0'>
                     <div>
                        <h1 className='fs-2'>
                           Best place to <span className='h1 fs-2 text-dark'>relax and enjoy different activities</span>
                        </h1>
                        <p className='d-block my-4 banner-paragraph'>For any inquiries and concerns, please don't hesitate to contact us.</p>
                     </div>
                     <div>
                        <Link className='btn btn-outline-primary btn-lg fw-bold rounded-style' to='/contact'>
                           Contact Us
                        </Link>
                     </div>
                  </div>
               </section>
            </div>
         </div>

         <section className='container my-3 my-lg-5'>
            <div className='my-5 text-center'>
               <h1>What does our customer says?</h1>
               <p className='banner-paragraph'>Customers that have witnessed before hand the services we have provided them.</p>
            </div>
            <div className='row m-5 justify-content-center align-items-center'>
               <div className='col-lg-4 text-center px-4'>
                  <h3 className='h5'>John Doe West</h3>
                  <p className='mb-4 mb-lg-0 banner-paragraph'>
                     The people in charge in the facility are very accommodating. The place is cozy and is maintained everyday.
                  </p>
               </div>
               <div className='col-lg-4 text-center px-4'>
                  <h3 className='h5'>Mary Ann Johnson</h3>
                  <p className='mb-4 mb-lg-0 banner-paragraph'>Excellent service! Very active customer service.</p>
               </div>
               <div className='col-lg-4 text-center px-4'>
                  <h3 className='h5'>Michael Amto</h3>
                  <p className='mb-4 mb-lg-0 banner-paragraph'>
                     This application has made the booking so much better, especially at this time of pandemic. The resort also offers food and other
                     services.
                  </p>
               </div>
            </div>
         </section>
         <Footer />
      </>
   );
};

export default LandingPage;

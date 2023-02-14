import React from 'react';
import Footer from './Footer';
import Header from './Header';
import { FaPhoneAlt } from 'react-icons/fa';
import { MdEmail, MdLocationOn } from 'react-icons/md';

const Contact = () => {
   return (
      <>
         <Header />
         <div className='shadow rounded container mt-4 mb-5 p-5'>
            <div>
               <h1 className='text-center h2'>Contact Us</h1>
            </div>
            <div className='my-5 d-flex flex-column flex-lg-row justify-content-center justify-content-lg-between align-items-center'>
               <div className='align-self-start'>
                  <div className='mb-5'>
                     <h2 className='h4'>Contact Information</h2>
                  </div>
                  <div className='ms-5'>
                     <div className='mb-4'>
                        <FaPhoneAlt className='text-dark me-2' /> 0910 091 2019
                     </div>
                     <div className='mb-4'>
                        <MdEmail className='text-dark me-2' /> ellemarbeach38@gmail.com
                     </div>
                     <div className='mb-4'>
                        <MdLocationOn className='text-dark me-2' /> 8011 Santa Maria, Philippines
                     </div>
                  </div>
               </div>
               <iframe
                  src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253694.47001480614!2d125.34132824237898!3d6.524702646977828!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32f9c318dd4b339b%3A0xe8ecc1672fdef056!2sEl%E2%80%99Lemar%20Beach%2038%20Resort!5e0!3m2!1sen!2sph!4v1643453714743!5m2!1sen!2sph'
                  width='500'
                  height='300'
                  className='mt-5 m-lg-0 border-0'
                  allowFullScreen=''
                  loading='lazy'
               ></iframe>
            </div>
         </div>
         <Footer />
      </>
   );
};

export default Contact;

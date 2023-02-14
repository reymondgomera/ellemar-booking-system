import { FaFacebookSquare, FaInstagramSquare, FaTwitter } from 'react-icons/fa';
const Footer = () => {
   return (
      <footer className='footer bg-primary'>
         <div className='d-flex justify-content-between mx-5 mt-5 mb-4'>
            <div className='w-50'>
               <h3 className='h6'>El'lemar Beach38 Resort</h3>
               <p>Enjoy the sunny beach in El'lemar Beach38. Situated in the shores of Davao Occidental book now and find comfort in our place.</p>
            </div>
            <div className='d-flex flex-column align-items-center'>
               <div>
                  <div>Follow us:</div>
                  <div className='social-style'>
                     <div>
                        <a className='text-reset' rel='noreferrer' target='_blank' href='https://www.facebook.com/ellemar38/?ref=page_internal'>
                           <FaFacebookSquare className='pe-3 footer-icons-style' />
                        </a>
                        <a href='/' className='text-reset' rel='noreferrer' target='_blank'>
                           <FaInstagramSquare className='pe-3 footer-icons-style' />
                        </a>
                        <a href='/' className='text-reset' rel='noreferrer' target='_blank'>
                           <FaTwitter className='pe-3 footer-icons-style' />
                        </a>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className='text-center copyright-style'>El'lemar Beach38 Resort &copy; 2022</div>
      </footer>
   );
};

export default Footer;

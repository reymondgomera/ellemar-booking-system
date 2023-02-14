import React from 'react';

const Modal = ({ target, title, children }) => {
   return (
      <>
         <div className='modal fade' id={target} data-bs-backdrop='static' data-bs-keyboard='false' tabIndex='-1'>
            <div className='modal-dialog modal-dialog-centered'>
               <div className='modal-content'>
                  {title && (
                     <div className='modal-header'>
                        <h5 className='modal-title' id='staticBackdropLabel'>
                           {title}
                        </h5>
                     </div>
                  )}
                  <div className='modal-body'>{children}</div>
               </div>
            </div>
         </div>
      </>
   );
};

export default Modal;

import { db } from '../firebase';
import { RiErrorWarningLine } from 'react-icons/ri';
import { query, onSnapshot, collection, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import Modal from './Modal';

const UserList = () => {
   const [staffs, setStaffs] = useState([]);
   const [error, setError] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [selectedRow, setSelectedRow] = useState('');

   const handleSelectedRow = (id, status) => {
      setSelectedRow({ id, status });
   };

   const handleUpdate = async () => {
      if (selectedRow.id && selectedRow.status) {
         try {
            const updatedStatus = selectedRow.status === 'active' ? 'inactive' : 'active';
            const docRef = doc(db, 'users', selectedRow.id);

            await updateDoc(docRef, { status: updatedStatus });
            toast.success("User's status updated successfully.");
            setSelectedRow({ id: selectedRow.id, status: updatedStatus });
         } catch (err) {
            console.error(err.message);
         }
      } else {
         toast.error('Please select a row.');
      }
   };

   useEffect(() => {
      const q = query(collection(db, 'users'), where('role', '!=', 'admin'));
      const unsubscribe = onSnapshot(
         q,
         snapshot => {
            if (!snapshot.empty) {
               setStaffs(
                  snapshot.docs.map(doc => ({
                     id: doc.id,
                     ...doc.data(),
                  }))
               );
            }
            setIsLoading(false);
         },
         err => {
            setError(err.message);
            console.error(err.message);
         }
      );

      // clean up
      return () => {
         unsubscribe();
      };
   }, []);

   return (
      <div className='d-flex flex-column mx-4 mt-5 pt-2 pb-4'>
         {!isLoading && error && <div className='text-center my-5'>{error}</div>}
         {!isLoading ? (
            <>
               <div className='d-flex flex-column table-responsive overflow-auto' style={{ height: '300px' }}>
                  <table className=''>
                     <thead>
                        <tr>
                           <th>Email</th>
                           <th>Password</th>
                           <th>Status</th>
                        </tr>
                     </thead>
                     <tbody>
                        {staffs.length > 0 ? (
                           staffs.map(({ id, email, password, status }, index) => (
                              <tr
                                 className={`table-row ${selectedRow.id === id ? ' active' : ''}`}
                                 key={index}
                                 onClick={() => handleSelectedRow(id, status)}
                                 onDoubleClick={() => handleSelectedRow('', '')}
                              >
                                 <td>{email}</td>
                                 <td>{password}</td>
                                 <td>{status}</td>
                              </tr>
                           ))
                        ) : (
                           <tr>
                              <td className='text-center' colSpan='3'>
                                 No users at the moment..
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
               <div className='mt-4 align-self-end'>
                  <button className='btn btn-primary py-2 px-4 rounded-style' data-bs-toggle='modal' data-bs-target='#update-user-status'>
                     Update
                  </button>
               </div>
            </>
         ) : (
            <div className='spinner-border text-primary spinner-lg mb-3 align-self-center justify-content-center' role='status'></div>
         )}

         {/* modal update  */}
         <Modal target='update-user-status'>
            <div className='d-flex flex-column justify-content-center mt-5 mb-2 mx-3'>
               <div className='d-flex align-items-center'>
                  <RiErrorWarningLine className='text-danger warning-icon me-2' />
                  <span> Are you sure you're going to update the status of this user?</span>
               </div>
               <div className='mt-5 align-self-end'>
                  <button className='btn btn-secondary py-2 px-4 rounded-style me-3' data-bs-dismiss='modal' onClick={() => setSelectedRow('')}>
                     Cancel
                  </button>
                  <button className='btn btn-primary py-2 px-4 rounded-style' data-bs-dismiss='modal' onClick={handleUpdate}>
                     Confirm
                  </button>
               </div>
            </div>
         </Modal>
      </div>
   );
};

export default UserList;

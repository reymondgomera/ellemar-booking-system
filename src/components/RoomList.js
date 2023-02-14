import { useState, useEffect } from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';
import { db } from '../firebase';
import { doc, updateDoc, query, onSnapshot, collection, orderBy } from 'firebase/firestore';
import { toast } from 'react-toastify';
import Modal from './Modal';

const RoomList = () => {
   const [rooms, setRooms] = useState([]);
   const [error, setError] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [selectedRow, setSelectedRow] = useState('');

   const handleSelectedRow = (id, status) => {
      setSelectedRow({ id, status });
   };

   const handleUpdate = async isUnavailable => {
      if (selectedRow.id && selectedRow.status) {
         try {
            const updatedStatus = isUnavailable
               ? 'unavailable'
               : selectedRow.status === 'unavailable'
               ? 'available'
               : selectedRow.status === 'available'
               ? 'occupied'
               : 'available';
            const docRef = doc(db, 'rooms', selectedRow.id);

            await updateDoc(docRef, { status: updatedStatus });
            toast.success("Room's status updated successfully.");
            setSelectedRow({ id: selectedRow.id, status: updatedStatus });
         } catch (err) {
            console.error(err.message);
         }
      } else {
         toast.error('Please select a row.');
      }
   };

   useEffect(() => {
      const q = query(collection(db, 'rooms'), orderBy('name', 'asc'));
      const unsubscribe = onSnapshot(
         q,
         snapshot => {
            if (!snapshot.empty) {
               setRooms(
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
                           <th>Name</th>
                           <th>Capacity</th>
                           <th>Status</th>
                           <th># of Single Bed</th>
                           <th># of King Bed</th>
                           <th># of People for Free Entrance Fee</th>
                           <th>Price</th>
                        </tr>
                     </thead>
                     <tbody>
                        {rooms.length > 0 ? (
                           rooms.map(({ id, name, capacity, numSingleBed, numKingBed, numPeopleFreeEntrance, price, status }, index) => (
                              <tr
                                 className={`table-row ${selectedRow.id === id ? ' active' : ''}`}
                                 key={index}
                                 onClick={() => handleSelectedRow(id, status)}
                                 onDoubleClick={() => handleSelectedRow('', '')}
                              >
                                 <td>{name}</td>
                                 <td>{capacity}</td>
                                 <td>{status}</td>
                                 <td>{numSingleBed}</td>
                                 <td>{numKingBed}</td>
                                 <td>{numPeopleFreeEntrance}</td>
                                 <td>{price}</td>
                              </tr>
                           ))
                        ) : (
                           <tr>
                              <td className='text-center' colSpan='8'>
                                 No rooms at the moment..
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
               <div className='mt-4 align-self-end'>
                  <button className='btn btn-danger py-2 px-4 rounded-style me-3' data-bs-toggle='modal' data-bs-target='#update-room-unavailable'>
                     Unavailable
                  </button>
                  <button className='btn btn-primary py-2 px-4 rounded-style' data-bs-toggle='modal' data-bs-target='#update-room-status'>
                     Update
                  </button>
               </div>
            </>
         ) : (
            <div className='spinner-border text-primary spinner-lg mb-3 align-self-center justify-content-center' role='status'></div>
         )}

         {/* modal update  */}
         <Modal target='update-room-status'>
            <div className='d-flex flex-column justify-content-center mt-5 mb-2 mx-3'>
               <div className='d-flex align-items-center'>
                  <RiErrorWarningLine className='text-danger warning-icon me-2' />
                  <span> Are you sure you're going to update the status of this room?</span>
               </div>
               <div className='mt-5 align-self-end'>
                  <button className='btn btn-secondary py-2 px-4 rounded-style me-3' data-bs-dismiss='modal' onClick={() => setSelectedRow('')}>
                     Cancel
                  </button>
                  <button className='btn btn-primary py-2 px-4 rounded-style' data-bs-dismiss='modal' onClick={() => handleUpdate(false)}>
                     Confirm
                  </button>
               </div>
            </div>
         </Modal>

         {/* modal update unavailable */}
         <Modal target='update-room-unavailable'>
            <div className='d-flex flex-column justify-content-center mt-5 mb-2 mx-3'>
               <div className='d-flex align-items-center'>
                  <RiErrorWarningLine className='text-danger warning-icon me-2' />
                  <span> Are you sure you're going to mark this room as "unavailable"?</span>
               </div>
               <div className='mt-5 align-self-end'>
                  <button className='btn btn-secondary py-2 px-4 rounded-style me-3' data-bs-dismiss='modal' onClick={() => setSelectedRow('')}>
                     Cancel
                  </button>
                  <button className='btn btn-primary py-2 px-4 rounded-style' data-bs-dismiss='modal' onClick={() => handleUpdate(true)}>
                     Confirm
                  </button>
               </div>
            </div>
         </Modal>
      </div>
   );
};

export default RoomList;

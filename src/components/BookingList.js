import { useState, useEffect } from 'react';
import { RiErrorWarningLine, RiSearchLine } from 'react-icons/ri';
import { doc, addDoc, getDoc, deleteDoc, updateDoc, query, onSnapshot, collection, orderBy, where } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db } from '../firebase';
import { CORKAGE_PRICE, ADULT_ENTRANCE_FEE, KID_ENTRANCE_FEE } from './Booking';
import moment from 'moment';
import { extendMoment } from 'moment-range';
import Modal from './Modal';

import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import './react_dates_overrides.css';

const BookingList = ({ user }) => {
   const [bookings, setBookings] = useState([]);
   const [error, setError] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [selectedRow, setSelectedRow] = useState('');
   const [searchTerm, setSearchTerm] = useState('');
   const [searchResults, setSearchResults] = useState([]);

   const [specificRoomBookings, setSpecificRoomBookings] = useState([]);
   const [startDate, setStartDate] = useState();
   const [endDate, setEndDate] = useState();
   const [focusedInput, setFocusedInput] = useState();

   const handleSelectedRow = (id, endDate, roomId, bill) => {
      setSelectedRow({ id, roomId, bill });
      setStartDate(moment(endDate.toDate()).add(1, 'days'));
      setEndDate(moment(endDate.toDate()).add(1, 'days'));
   };

   const clearSelectedRow = () => {
      setSelectedRow('');
      setStartDate(null);
      setEndDate(null);
      setSpecificRoomBookings([]);
   };

   const deleteBooking = async () => {
      if (selectedRow.id) {
         try {
            await deleteDoc(doc(db, 'bookings', selectedRow.id));
            toast.success('Booking deleted successfully.');
            clearSelectedRow();
         } catch (err) {
            console.error(err.message);
         }
      } else {
         toast.error('Please select a row.');
      }
   };

   const search = (e, searchTerm) => {
      e.preventDefault();
      if (searchTerm) {
         setSearchResults(bookings.filter(booking => booking.name.toLowerCase().includes(searchTerm.toLowerCase())));
      } else setSearchResults(bookings);
   };

   const checkoutBooking = async () => {
      if (selectedRow.id) {
         try {
            const booking = await getDoc(doc(db, 'bookings', selectedRow.id));
            await deleteDoc(doc(db, 'bookings', selectedRow.id));

            await addDoc(collection(db, 'sales'), {
               ...booking.data(),
               staffInchargeEmail: user.email,
               staffInchargeId: user.uid,
            });
            toast.success('Booking check-out successfully.');
            clearSelectedRow();
         } catch (err) {
            console.error(err.message);
         }
      } else {
         toast.error('Please select a row.');
      }
   };

   const blockedDates = momentDate => {
      if (specificRoomBookings.length > 0) {
         for (let i = 0; i < specificRoomBookings.length; i++) {
            if (
               momentDate.isSame(specificRoomBookings[i].startDate) ||
               momentDate.isBetween(moment(specificRoomBookings[i].startDate), moment(specificRoomBookings[i].endDate).add(1, 'days'))
            ) {
               return true;
            } else continue;
         }
      }
   };

   const isRangeOverLap = (startDate, endDate) => {
      const momentRange = extendMoment(moment);
      const customerBookingRange = momentRange.range(moment(startDate), moment(endDate));
      let isOverlaps = false;

      if (specificRoomBookings.length > 0) {
         // check if Existing booking schedule
         for (let i = 0; i < specificRoomBookings.length; i++) {
            const existingBookingRange = momentRange.range(moment(specificRoomBookings[i].startDate), moment(specificRoomBookings[i].endDate));
            if (customerBookingRange.overlaps(existingBookingRange) || moment(endDate).isSame(moment(specificRoomBookings[i].startDate)))
               isOverlaps = true;
            else continue;
         }
      } else isOverlaps = false;

      return isOverlaps;
   };

   const extendBooking = async () => {
      if (selectedRow.id) {
         if (endDate) {
            if (isRangeOverLap(startDate.format('L'), endDate.format('L'))) {
               toast.error('Your booking schedule is invalid. Please choose another date.', { autoClose: 4000 });
               return;
            }
            const room = await getDoc(doc(db, 'rooms', selectedRow.roomId));
            const extendRoomFee = (endDate.diff(startDate, 'days') + 1) * parseFloat(room.data().price);
            const extendedBill = parseFloat(selectedRow.bill) + parseFloat(extendRoomFee);

            console.log(('difference', endDate.diff(startDate, 'days') + 1));
            console.log('prev bill = ', selectedRow.bill);
            console.log('room price = ', room.data().price);
            console.log('extendRoomFee = ', extendRoomFee);
            console.log('extendedBill =', extendedBill.toFixed(2));

            await updateDoc(doc(db, 'bookings', selectedRow.id), { checkoutDate: endDate.toDate(), bill: extendedBill.toFixed(2) });
            toast.success('Booking updated successfully.');
            setSelectedRow({ id: selectedRow.id, roomdId: selectedRow.roomId, bill: extendedBill });
            clearSelectedRow();
         } else toast.error('Please complete the required field.');
      } else toast.error('Please select a row.');
   };

   useEffect(() => {
      const q = query(collection(db, 'bookings'), orderBy('dateIssue', 'desc'));
      const unsubscribe = onSnapshot(
         q,
         snaphot => {
            if (!snaphot.empty) {
               setBookings(
                  snaphot.docs.map(doc => ({
                     id: doc.id,
                     ...doc.data(),
                  }))
               );

               setSearchResults(
                  snaphot.docs.map(doc => ({
                     id: doc.id,
                     ...doc.data(),
                  }))
               );
            } else setBookings([]);
            setIsLoading(false);
         },
         err => {
            setError(error.mesage);
            console.error(err.message);
         }
      );

      // clean up
      return () => {
         unsubscribe();
      };
   }, []);

   useEffect(() => {
      if (selectedRow.roomId) {
         const q = query(collection(db, 'bookings'), where('roomId', '==', selectedRow.roomId));
         const unsubscribe = onSnapshot(
            q,
            snapshot => {
               if (!snapshot.empty) {
                  setSpecificRoomBookings(
                     snapshot.docs.map(doc => ({
                        id: doc.id,
                        startDate: moment(doc.data().checkinDate.toDate()).format('L'),
                        endDate: moment(doc.data().checkoutDate.toDate()).format('L'),
                     }))
                  );
               }
            },
            err => console.error(err)
         );

         // clean up
         return () => {
            unsubscribe();
         };
      }
   }, [selectedRow]);

   return (
      <div className='d-flex flex-column mx-4 mt-5 pt-2 pb-4'>
         {!isLoading && error && <div className='text-center my-5'>{error}</div>}
         {!isLoading ? (
            <>
               <form className='align-self-end d-flex mb-4' onSubmit={e => search(e, searchTerm)}>
                  <input
                     className='text-center form-control border-top-0 border-start-0 border-end-0'
                     type='search'
                     name='search'
                     id='search'
                     placeholder='e.g. John Doe'
                     onChange={e => setSearchTerm(e.target.value)}
                  />
                  <button className='btn search-btn p-0 mx-2' type='submit'>
                     <RiSearchLine className='fs-4' />
                  </button>
               </form>
               <div className='d-flex flex-column table-responsive overflow-auto' style={{ height: '300px' }}>
                  <table className=''>
                     <thead>
                        <tr>
                           <th>Name</th>
                           <th>Address</th>
                           <th>Phone Number</th>
                           <th># of Adult</th>
                           <th># of Kid</th>
                           <th>Room Name</th>
                           <th>Date Issue</th>
                           <th>Check-in Date</th>
                           <th>Check-out Date</th>
                           <th>Corkage</th>
                           <th>Bill</th>
                        </tr>
                     </thead>
                     <tbody>
                        {bookings.length > 0 ? (
                           searchResults.length > 0 ? (
                              searchResults.map(
                                 (
                                    {
                                       id,
                                       name,
                                       address,
                                       phoneNumber,
                                       numAdult,
                                       numKid,
                                       roomId,
                                       roomName,
                                       dateIssue,
                                       checkinDate,
                                       checkoutDate,
                                       corkage,
                                       bill,
                                    },
                                    index
                                 ) => (
                                    <tr
                                       className={`table-row ${selectedRow.id === id ? ' active' : ''}`}
                                       key={index}
                                       onClick={() => handleSelectedRow(id, checkoutDate, roomId, bill)}
                                       onDoubleClick={() => clearSelectedRow()}
                                    >
                                       <td>{name}</td>
                                       <td>{address}</td>
                                       <td>{phoneNumber}</td>
                                       <td>{numAdult}</td>
                                       <td>{numKid}</td>
                                       <td>{roomName}</td>
                                       <td>{moment(dateIssue.toDate()).format('L')}</td>
                                       <td>{moment(checkinDate.toDate()).format('L')}</td>
                                       <td>{moment(checkoutDate.toDate()).format('L')}</td>
                                       <td>{corkage}</td>
                                       <td>{bill}</td>
                                    </tr>
                                 )
                              )
                           ) : (
                              <tr>
                                 <td className='text-center' colSpan='11'>
                                    No result found..
                                 </td>
                              </tr>
                           )
                        ) : (
                           <tr>
                              <td className='text-center' colSpan='10'>
                                 No bookings at the moment..
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>

               <div className='d-flex justify-content-between mt-4'>
                  <div>
                     <button className='btn btn-danger py-2 px-4 rounded-style me-3' data-bs-toggle='modal' data-bs-target='#delete-booking'>
                        Delete
                     </button>
                     <button className='btn btn-primary py-2 px-4 rounded-style' data-bs-toggle='modal' data-bs-target='#checkout-booking'>
                        Check-out
                     </button>
                  </div>

                  <div className='d-flex justify-content-between'>
                     <DateRangePicker
                        small
                        required
                        block
                        showDefaultInputIcon
                        startDate={startDate}
                        startDateId='checkin-date'
                        endDate={endDate}
                        endDateId='checkout-date'
                        onDatesChange={({ startDate, endDate }) => {
                           setStartDate(startDate);
                           setEndDate(endDate);
                        }}
                        keepOpenOnDateSelect
                        openDirection='up'
                        focusedInput={focusedInput}
                        onFocusChange={focusedInput => setFocusedInput(focusedInput)}
                        startDatePlaceholderText='Check-in Date'
                        endDatePlaceholderText='Check-out Date'
                        disabled={selectedRow.id ? 'startDate' : true}
                        isDayBlocked={momentDate => blockedDates(momentDate)}
                     />
                     <div className='ms-3'>
                        <button className='btn btn-primary py-2 px-4 rounded-style' data-bs-toggle='modal' data-bs-target='#extend-booking'>
                           Update
                        </button>
                     </div>
                  </div>
               </div>
            </>
         ) : (
            <div className='spinner-border text-primary spinner-lg mb-3 align-self-center justify-content-center' role='status'></div>
         )}

         {/* modal delete  */}
         <Modal target='delete-booking'>
            <div className='d-flex flex-column justify-content-center mt-5 mb-2 mx-3'>
               <div className='d-flex align-items-center'>
                  <RiErrorWarningLine className='text-danger warning-icon me-2' />
                  <span> Are you sure you're going to cancel this booking?</span>
               </div>
               <div className='mt-5 align-self-end'>
                  <button className='btn btn-secondary py-2 px-4 rounded-style me-3' data-bs-dismiss='modal' onClick={() => clearSelectedRow()}>
                     Cancel
                  </button>
                  <button className='btn btn-primary py-2 px-4 rounded-style' data-bs-dismiss='modal' onClick={deleteBooking}>
                     Confirm
                  </button>
               </div>
            </div>
         </Modal>

         {/* modal checkout  */}
         <Modal target='checkout-booking'>
            <div className='d-flex flex-column justify-content-center mt-5 mb-2 mx-3'>
               <div className='d-flex align-items-center'>
                  <RiErrorWarningLine className='text-danger warning-icon me-2' />
                  <span> Are you sure you're going to check-out this booking?</span>
               </div>
               <div className='mt-5 align-self-end'>
                  <button className='btn btn-secondary py-2 px-4 rounded-style me-3' data-bs-dismiss='modal' onClick={() => clearSelectedRow()}>
                     Cancel
                  </button>
                  <button className='btn btn-primary py-2 px-4 rounded-style' data-bs-dismiss='modal' onClick={checkoutBooking}>
                     Confirm
                  </button>
               </div>
            </div>
         </Modal>

         {/* modal update */}
         <Modal target='extend-booking'>
            <div className='d-flex flex-column justify-content-center mt-5 mb-2 mx-3'>
               <div className='d-flex align-items-center'>
                  <RiErrorWarningLine className='text-danger warning-icon me-2' />
                  <span> Are you sure you're going to extend the date of this booking?</span>
               </div>
               <div className='mt-5 align-self-end'>
                  <button className='btn btn-secondary py-2 px-4 rounded-style me-3' data-bs-dismiss='modal' onClick={() => clearSelectedRow()}>
                     Cancel
                  </button>
                  <button className='btn btn-primary py-2 px-4 rounded-style' data-bs-dismiss='modal' onClick={extendBooking}>
                     Confirm
                  </button>
               </div>
            </div>
         </Modal>
      </div>
   );
};

export default BookingList;

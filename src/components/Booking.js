import { useState, useEffect, useRef } from 'react';
import Footer from './Footer';
import Header from './Header';
import { Link, useParams } from 'react-router-dom';
import moment from 'moment';
import 'react-phone-number-input/style.css';
import './react_phone_number_input_overrides.css';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { db } from '../firebase';
import { collection, doc, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { extendMoment } from 'moment-range';

import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import './react_dates_overrides.css';
import { toast } from 'react-toastify';

export const CORKAGE_PRICE = [
   { id: 1, name: 'Small Lechon', price: 200 },
   { id: 2, name: 'Big Lechon', price: 300 },
   { id: 3, name: 'Small Lechon w/drinks', price: 300 },
   { id: 4, name: 'Big Lechon w/drinks', price: 400 },
];
export const ADULT_ENTRANCE_FEE = 30;
export const KID_ENTRANCE_FEE = 20;

const Booking = () => {
   const { roomId } = useParams();
   const [room, setRoom] = useState('');
   const [bookings, setBookings] = useState([]);
   const formRef = useRef(null);

   const [pageNum, setPageNum] = useState(2);
   const [inputs, setInputs] = useState({
      fname: '',
      lname: '',
      mname: '',
      address: '',
   });
   const [phoneNumber, setPhoneNumber] = useState('');
   const [phoneNumberError, setPhoneNumberError] = useState(false);
   const phoneNumberInputRef = useRef();
   const [countryCode, setCountryCode] = useState('');
   const { fname, lname, mname, address } = inputs;

   const [corkage, setCorkage] = useState('');
   const [quantity, setQuantity] = useState('');
   const [isCorkage, setIsCorkage] = useState(false);
   const [bill, setBill] = useState('');

   const [numAdult, setNumAdult] = useState('');
   const [numKid, setNumKid] = useState('');

   const [startDate, setStartDate] = useState();
   const [endDate, setEndDate] = useState();
   const [focusedInput, setFocusedInput] = useState();
   const [datePickerError, setDatePickerError] = useState(false);

   const handleInputChange = e => {
      setInputs({ ...inputs, [e.target.name]: e.target.value });
   };

   const handleCorkageChange = e => {
      if (!e.target.checked) {
         setIsCorkage(e.target.checked);
         setQuantity('');
         setCorkage('');
      } else {
         setIsCorkage(e.target.checked);
      }
   };

   const blockedDates = momentDate => {
      if (bookings.length > 0) {
         for (let i = 0; i < bookings.length; i++) {
            if (
               momentDate.isSame(bookings[i].startDate) ||
               momentDate.isBetween(moment(bookings[i].startDate), moment(bookings[i].endDate).add(1, 'days'))
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

      if (bookings.length > 0) {
         // check if Existing booking schedule
         for (let i = 0; i < bookings.length; i++) {
            const existingBookingRange = momentRange.range(moment(bookings[i].startDate), moment(bookings[i].endDate));
            if (customerBookingRange.overlaps(existingBookingRange)) isOverlaps = true;
            else continue;
         }
      } else isOverlaps = false;

      return isOverlaps;
   };

   const calculateBill = () => {
      formRef.current.className += ' was-validated';

      if (phoneNumber) document.querySelectorAll('.PhoneInputInput')[0].classList.add('valid');
      if (startDate && endDate) document.querySelectorAll('.DateRangePickerInput__withBorder')[0].classList.add('valid');

      if (
         fname &&
         lname &&
         address &&
         startDate &&
         endDate &&
         phoneNumber &&
         numAdult !== '' &&
         numKid !== '' &&
         !isNaN(numAdult) &&
         !isNaN(numKid)
      ) {
         if ((isCorkage && quantity < 0) || numAdult < 0 || numKid < 0) {
            toast.error('Entered number must not less than 0.');
            return;
         }
         if (numAdult === 0 && numKid === 0) {
            toast.error('Both # of adult and # of kid cannot be equal to 0 at the same time.', { autoClose: 4000 });
            return;
         }
         if (isRangeOverLap(startDate.format('L'), endDate.format('L'))) {
            toast.error('Your booking schedule is invalid. Please choose another date.', { autoClose: 4000 });
            return;
         }
         if (!isValidPhoneNumber(phoneNumber)) {
            toast.error('Invalid phone number');
            return;
         }
         if ((isCorkage && !quantity) || (isCorkage && !corkage)) {
            if (isCorkage && quantity <= 0 && quantity !== '') {
               toast.error('Corkage quantity cannot be equal to 0.');
               return;
            }
            toast.error('Please complete all required fields.');
            return;
         }

         const corkageFee = isCorkage && quantity ? CORKAGE_PRICE.find(c => c.id === corkage).price * quantity : 0;
         const roomFee = (endDate.diff(startDate, 'days') + 1) * parseFloat(room.price);
         const totalGuest = numAdult + numKid;
         let bill = 0;
         let adultFee = numAdult * ADULT_ENTRANCE_FEE;
         let kidFee = numKid * KID_ENTRANCE_FEE;
         let totalEntranceFee = 0;
         console.log('corkageFee =', corkageFee);

         if (totalGuest <= room.capacity) {
            if (totalGuest > room.numPeopleFreeEntrance) {
               // condition to invoke if the number of adult is greater than the number of kid,
               // then the bases for subtraction of # of ppl of Free intrance fee is ADULT
               // result is the result value of subtracting # of adult to the # of ppl for intrace fee
               if (numAdult >= numKid) {
                  let result = numAdult - room.numPeopleFreeEntrance;

                  if (result <= 0) {
                     adultFee = 0;

                     //if the result is < 0 , like -1 or negative numbers which represent sa nabilin na # of ppl for free intrance fee
                     // then get the absoloute value of the result, to make it positive, then use it to subtract to the number of kid
                     if (result <= 0) {
                        result = Math.abs(result);
                        if (numKid > 0) {
                           result = numKid - result;
                           if (result > 0) kidFee = result * KID_ENTRANCE_FEE;
                        }
                     }
                  } else adultFee = result * ADULT_ENTRANCE_FEE;
               } else {
                  // condition to invoke if the number of kid is greater than the number of adult,
                  // then the bases for subtraction of # of ppl of Free intrance fee is KID
                  // result is the result value of subtracting # of adult to the # of ppl for intrace fee
                  let result = numKid - room.numPeopleFreeEntrance;
                  if (result <= 0) {
                     kidFee = 0;

                     // if the result is < 0 , like -1 or negative numbers which represent sa nabilin na # of ppl for free intrance fee
                     // then get the absoloute value of the result, to make it positive, then use it to subtract to the number of adult
                     if (result <= 0) {
                        result = Math.abs(result);
                        if (numAdult > 0) {
                           result = numAdult - result;
                           if (result > 0) adultFee = result * ADULT_ENTRANCE_FEE;
                        }
                     }
                  } else kidFee = result * KID_ENTRANCE_FEE;
               }

               totalEntranceFee = adultFee + kidFee;
            } else {
               totalEntranceFee = 0;
            }

            console.log('kidFee = ', kidFee);
            console.log('adultFee = ', adultFee);
            console.log('\ntotal entrance fee = ', totalEntranceFee);

            bill = roomFee + totalEntranceFee + corkageFee;
            console.log('bill = ', bill.toFixed(2));
            setBill(bill.toFixed(2));
            setPageNum(prev => prev + 1);
         } else {
            toast.error("The number of guest exceed the room's capacity", { autoClose: 3500 });
            return;
         }
      } else {
         toast.error('Please complete all required fields.');
         if (!startDate && !endDate) {
            setDatePickerError(true);
            document.querySelectorAll('.DateRangePickerInput__withBorder')[0].classList.add('error');
         }
         if (!phoneNumber) {
            setPhoneNumberError(true);
            document.querySelectorAll('.PhoneInputInput')[0].classList.add('error');
         }
      }
   };

   const addBooking = async (name, address, roomName, roomId, phoneNumber, numKid, numAdult, checkinDate, checkoutDate, corkage, bill) => {
      try {
         await addDoc(collection(db, 'bookings'), {
            name,
            address,
            phoneNumber,
            roomId,
            roomName,
            numKid,
            numAdult,
            checkinDate,
            checkoutDate,
            corkage,
            bill,
            dateIssue: new Date(),
         });
         toast.success('Room booked successfully!');
      } catch (err) {
         console.error(err.message);
      }
   };

   const confirmBooking = () => {
      const name = `${lname} ${fname} ${mname && mname.charAt(0)}.`;
      const corkageString = isCorkage ? CORKAGE_PRICE.find(c => c.id === corkage).name + ` ${quantity}x` : 'N/A';

      addBooking(name, address, room.name, roomId, phoneNumber, numKid, numAdult, startDate.toDate(), endDate.toDate(), corkageString, bill);
      setPageNum(prev => prev + 1);
   };

   const lookupCountryCode = async position => {
      const { latitude, longitude } = position.coords;
      const geoApiURL = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;

      const userLocationInfo = await fetch(geoApiURL);
      const data = await userLocationInfo.json();
      setCountryCode(data.countryCode);
   };

   useEffect(() => {
      const unsubscribe = onSnapshot(
         doc(db, 'rooms', roomId),
         doc => {
            if (doc.exists) setRoom(doc.data());
         },
         err => console.error(err.message)
      );

      // clean up
      return () => {
         unsubscribe();
      };
   }, []);

   useEffect(() => {
      // detect current locaiton of user upon approval
      navigator.geolocation.getCurrentPosition(lookupCountryCode, () => console.log('Permission was rejected'));
   }, []);

   useEffect(() => {
      if (datePickerError && startDate && endDate) {
         setDatePickerError(false);
         document.querySelectorAll('.DateRangePickerInput__withBorder')[0].classList.remove('error');
         document.querySelectorAll('.DateRangePickerInput__withBorder')[0].classList.add('valid');
      }
      if (phoneNumberError && phoneNumber) {
         document.querySelectorAll('.PhoneInputInput')[0].classList.remove('error');
         document.querySelectorAll('.PhoneInputInput')[0].classList.add('valid');
      }
      if (phoneNumberError && !phoneNumber) {
         document.querySelectorAll('.PhoneInputInput')[0].classList.remove('valid');
         document.querySelectorAll('.PhoneInputInput')[0].classList.add('error');
      }
   }, [phoneNumber, startDate, endDate]);

   useEffect(() => {
      const q = query(collection(db, 'bookings'), where('roomId', '==', roomId));
      const unsubscribe = onSnapshot(
         q,
         snapshot => {
            if (!snapshot.empty) {
               setBookings(
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
   }, []);

   return (
      <>
         <Header />

         {pageNum === 2 && (
            <div className='shadow rounded container mt-4 mb-5 p-5'>
               {/* progress step */}
               <div className='step-progressbar-container w-100'>
                  <ul className='progressbar'>
                     <li className='icon-check fw-bold text-primary'>Choose your room</li>
                     <li className='icon-uncheck fw-bold text-primary '>Enter your basic information</li>
                     <li className='icon-uncheck fw-bold text-primary'>Review</li>
                  </ul>
               </div>

               {/* form */}
               <form ref={formRef} className='mt-4 row needs-validation' noValidate>
                  <div className='mt-4 mt-lg-0 col-lg-4'>
                     <input
                        value={fname}
                        type='text'
                        className='form-control form-control-group-style-sm rounded-style'
                        id='fname'
                        name='fname'
                        placeholder='First Name'
                        required
                        onChange={handleInputChange}
                     />
                     {!fname && <div className='invalid-feedback py-1 px-1'>First Name can't be empty</div>}
                  </div>
                  <div className='mt-4 mt-lg-0 col-lg-4'>
                     <input
                        value={lname}
                        type='text'
                        className='form-control form-control-group-style-sm rounded-style'
                        id='lname'
                        name='lname'
                        placeholder='Last Name'
                        required
                        onChange={handleInputChange}
                     />
                     {!lname && <div className='invalid-feedback py-1 px-1'>Last Name can't be empty</div>}
                  </div>
                  <div className='mt-4 mt-lg-0 col-lg-4'>
                     <input
                        value={mname}
                        type='text'
                        className='form-control form-control-group-style-sm rounded-style'
                        id='mname'
                        name='mname'
                        placeholder='Middle Name'
                        onChange={handleInputChange}
                     />
                  </div>
                  <div className='mt-4 col-lg-6'>
                     <textarea
                        value={address}
                        className='form-control form-control-group-style-sm rounded-style'
                        name='address'
                        id='address'
                        cols='30'
                        rows='10'
                        onChange={handleInputChange}
                        required
                        placeholder='Address'
                     ></textarea>
                     {!address && <div className='invalid-feedback py-1 px-1'>Address can't be empty</div>}
                  </div>
                  <div className='mt-4 d-flex flex-column justify-content-between col-lg-6'>
                     <div>
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
                           focusedInput={focusedInput}
                           onFocusChange={focusedInput => setFocusedInput(focusedInput)}
                           startDatePlaceholderText='Check-in Date'
                           endDatePlaceholderText='Check-out Date'
                           isDayBlocked={momentDate => blockedDates(momentDate)}
                        />
                        {datePickerError && (
                           <div className='py-1 px-1' style={{ fontSize: '.875em', color: '#dc3545', marginTop: '.25rem' }}>
                              Check-in and check-out dates can't be empty
                           </div>
                        )}
                     </div>

                     <div className='row mt-4 mt-lg-0'>
                        <div className='col-lg-6 mt-4 mt-lg-0'>
                           <input
                              value={numAdult}
                              type='number'
                              className='form-control form-control-group-style-sm rounded-style'
                              id='numAdult'
                              name='numAdult'
                              required
                              min='0'
                              placeholder='Number of Adult'
                              onChange={e => setNumAdult(parseInt(e.target.value))}
                           />
                           {!numAdult && <div className='invalid-feedback py-1 px-1'># of adult can't be empty</div>}
                        </div>
                        <div className='col-lg-6 mt-4 mt-lg-0'>
                           <input
                              value={numKid}
                              type='number'
                              className='form-control form-control-group-style-sm rounded-style'
                              id='numKid'
                              name='numKid'
                              required
                              min='0'
                              placeholder='Number of Kid'
                              onChange={e => setNumKid(parseInt(e.target.value))}
                           />
                           {!numKid && <div className='invalid-feedback py-1 px-1'># of Kid can't be empty</div>}
                        </div>
                     </div>

                     <div className='mt-4 mt-lg-0'>
                        <PhoneInput
                           ref={phoneNumberInputRef}
                           withCountryCallingCode
                           defaultCountry={countryCode}
                           value={phoneNumber}
                           onChange={setPhoneNumber}
                           placeholder='Phone Number'
                        />
                        {phoneNumberError && !phoneNumber && (
                           <div className='py-1 px-1' style={{ fontSize: '.875em', color: '#dc3545', marginTop: '.25rem' }}>
                              Phone number can't be empty
                           </div>
                        )}
                     </div>
                  </div>
                  <div className='mt-4 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center col'>
                     <div className='d-flex align-items-center me-lg-4'>
                        <div className='form-check me-3'>
                           <input
                              value={isCorkage}
                              checked={isCorkage}
                              className='form-check-input'
                              type='checkbox'
                              id='iscorkage'
                              name='iscorkage'
                              onChange={e => handleCorkageChange(e)}
                           />
                           <label className='form-check-label fw-bold text-small' htmlFor='iscorkage'>
                              Corkage
                           </label>
                        </div>

                        <div className='flex-grow-1 flex-lg-grow-0 d-flex align-items-center'>
                           <input
                              value={quantity}
                              type='number'
                              className='form-control form-control-group-style-sm rounded-style'
                              id='quantity'
                              name='quantity'
                              required
                              min='1'
                              disabled={!isCorkage}
                              placeholder='Quantity'
                              onChange={e => setQuantity(parseInt(e.target.value))}
                           />
                           {!quantity && <div className='invalid-feedback py-1 px-1'>Quantity and corkage can't be empty</div>}
                        </div>
                     </div>

                     <div className='mt-4 mt-lg-0 d-flex'>
                        <div className='form-check me-3'>
                           <input
                              className='form-check-input'
                              type='radio'
                              name='corkage'
                              checked={corkage === 1 && true}
                              id='small-lechon'
                              value='1'
                              disabled={!isCorkage}
                              required
                              onChange={e => setCorkage(parseInt(e.target.value))}
                           />
                           <label className='form-check-label' htmlFor='small-lechon'>
                              Small Lechon
                           </label>
                        </div>
                        <div className='form-check me-3'>
                           <input
                              className='form-check-input'
                              type='radio'
                              name='corkage'
                              checked={corkage === 2 && true}
                              id='big-lechon'
                              value='2'
                              disabled={!isCorkage}
                              required
                              onChange={e => setCorkage(parseInt(e.target.value))}
                           />
                           <label className='form-check-label' htmlFor='big-lechon'>
                              Big Lechon
                           </label>
                        </div>
                        <div className='form-check me-3'>
                           <input
                              className='form-check-input'
                              type='radio'
                              name='corkage'
                              checked={corkage === 3 && true}
                              id='small-lechon-wdrink'
                              value='3'
                              disabled={!isCorkage}
                              required
                              onChange={e => setCorkage(parseInt(e.target.value))}
                           />
                           <label className='form-check-label' htmlFor='small-lechon-wdrink'>
                              Small Lechon w/drinks
                           </label>
                        </div>
                        <div className='form-check me-3'>
                           <input
                              className='form-check-input'
                              type='radio'
                              name='corkage'
                              checked={corkage === 4 && true}
                              id='big-lechon-wdrink'
                              value='4'
                              disabled={!isCorkage}
                              required
                              onChange={e => setCorkage(parseInt(e.target.value))}
                           />
                           <label className='form-check-label' htmlFor='big-lechon-wdrink'>
                              Big Lechon w/drinks
                           </label>
                        </div>
                     </div>
                  </div>

                  <div className='mt-4 d-flex justify-content-end'>
                     <div>
                        <Link className='btn btn-danger py-2 px-4 rounded-style me-3' to='/rooms'>
                           Cancel
                        </Link>
                        <button className='btn btn-primary py-2 px-4 rounded-style' type='button' onClick={calculateBill}>
                           Next
                        </button>
                     </div>
                  </div>
               </form>
            </div>
         )}

         {pageNum === 3 && (
            <div className='shadow rounded container mt-4 mb-5 p-5'>
               {/* progress step */}
               <div className='step-progressbar-container w-100'>
                  <ul className='progressbar'>
                     <li className='icon-check fw-bold text-primary'>Choose your room</li>
                     <li className='icon-check fw-bold text-primary '>Enter your basic information</li>
                     <li className='icon-uncheck fw-bold text-primary'>Review</li>
                  </ul>
               </div>

               <div className='d-flex justify-content-between'>
                  <div className=''>
                     <div className='px-2 px-lg-0 my-2'>
                        <strong className='me-2'>Name:</strong>
                        {lname}, {fname} {mname && `${mname.charAt(0)}.`}
                     </div>
                     <div className='px-2 px-lg-0 my-2'>
                        <strong className='me-2'>Address:</strong>
                        {address}
                     </div>
                     <div className='px-2 px-lg-0 my-2'>
                        <strong className='me-2'>Phone Number:</strong>
                        {phoneNumber}
                     </div>
                     <div className='px-2 px-lg-0 my-2'>
                        <strong className='me-2'>Room:</strong>
                        {room.name}
                     </div>
                  </div>

                  <div className=''>
                     <div className='px-2 px-lg-0 my-2'>
                        <strong className='me-2'>Number of Adults:</strong>
                        {numAdult}
                     </div>
                     <div className='px-2 px-lg-0 my-2'>
                        <strong className='me-2'>Number of Kids:</strong>
                        {numKid}
                     </div>
                     <div className='px-2 px-lg-0 my-2'>
                        <strong className='me-2'>Corkage:</strong>
                        {isCorkage ? CORKAGE_PRICE.find(c => c.id === corkage).name + ` ${quantity}x` : 'N/A'}
                     </div>
                  </div>

                  <div className=''>
                     <div className='px-2 px-lg-0 my-2'>
                        <strong className='me-2'>Date Issue:</strong>
                        {moment(new Date()).format('L')}
                     </div>
                     <div className='px-2 px-lg-0 my-2'>
                        <strong className='me-2'>Check-in Date:</strong>
                        {startDate.format('L')}
                     </div>
                     <div className='px-2 px-lg-0 my-2'>
                        <strong className='me-2'>Check-out Date:</strong>
                        {endDate.format('L')}
                     </div>
                  </div>
               </div>
               <div className='d-flex justify-content-end col-12'>
                  <h2 className='my-4'>
                     Bill: <span className='h1 fs-1'>₱</span> {bill}
                  </h2>
               </div>

               <div className='mt-4 d-flex justify-content-end'>
                  <div>
                     <button className='btn btn-danger py-2 px-4 rounded-style me-3' onClick={() => setPageNum(prev => prev - 1)}>
                        Previous
                     </button>
                     <button className='btn btn-primary py-2 px-4 rounded-style' type='button' onClick={confirmBooking}>
                        Confirm
                     </button>
                  </div>
               </div>
            </div>
         )}

         {pageNum === 4 && (
            <div className='shadow rounded container mt-4 mb-5 p-5'>
               {/* progress step */}
               <div className='step-progressbar-container w-100'>
                  <ul className='progressbar'>
                     <li className='icon-check fw-bold text-primary'>Choose your room</li>
                     <li className='icon-check fw-bold text-primary '>Enter your basic information</li>
                     <li className='icon-check fw-bold text-primary'>Review</li>
                  </ul>
               </div>

               <div className='d-flex flex-column justify-content-center align-items-center p-5 my-2'>
                  <h1 className='text-primary'>Done!</h1>
                  <p className='text-primary fw-bold'>Thank you, we're happy to have you in our resort.</p>
               </div>
            </div>
         )}
         <Footer />
      </>
   );
};

export default Booking;

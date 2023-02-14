import React, { useRef, useState } from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import { db, storage } from '../firebase';
import { doc, updateDoc, addDoc, collection, query, getDocs, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const AddRoom = () => {
   const [inputs, setInputs] = useState({
      name: '',
      capacity: '',
      numSingleBed: '',
      numKingBed: '',
      price: '',
      numPeopleFreeEntrance: '',
   });
   const { name, capacity, numSingleBed, numKingBed, price, numPeopleFreeEntrance } = inputs;

   const formRef = useRef();
   const fileRef = useRef();
   const [images, setImages] = useState([]);
   const [isUploading, setIsUploading] = useState(false);

   const populateArray = size => {
      const array = [];
      for (let i = 1; i <= size; i++) {
         array.push(i);
      }
      return array;
   };

   const handleInputChange = e => {
      setInputs({ ...inputs, [e.target.name]: e.target.value });
   };

   const handleSelectedImages = e => {
      setImages([...e.target.files]);
   };

   const reset = () => {
      setInputs({ name: '', capacity: '', numSingleBed: '', numKingBed: '', price: '', numPeopleFreeEntrance: '' });
      setImages([]);
   };

   const isFilesSupported = () => {
      let isSupported = false;
      for (let i = 0; i < images.length; i++) {
         console.log(images[i].type);
         if (images[i].type === 'image/jpeg' || images[i].type === 'image/png') {
            isSupported = true;
            break;
         } else continue;
      }
      return isSupported;
   };

   const handleSubmit = async () => {
      formRef.current.className += ' was-validated';

      try {
         if (name && numSingleBed && numKingBed && capacity && price && numPeopleFreeEntrance && images.length > 0) {
            const q = query(collection(db, 'rooms'), where('name', '==', name));
            const querySnapshot = await getDocs(q);

            // console.log('isSupported = ', isSupported);
            if (!querySnapshot.empty) {
               toast.error('Room name already exist.');
               return;
            }
            if (parseInt(numPeopleFreeEntrance) >= parseInt(capacity)) {
               toast.error("# of people for free entrance fee must be less than room's capacity ", { autoClose: 3200 });
               return;
            }
            if (!isFilesSupported()) {
               toast.error('File/s not supported.');
               return;
            }

            if (images.length === 1) {
               setIsUploading(true);
               const roomDocument = await addDoc(collection(db, 'rooms'), {
                  name,
                  numSingleBed: parseInt(numSingleBed),
                  numKingBed: parseInt(numKingBed),
                  capacity: parseInt(capacity),
                  price: parseFloat(price).toFixed(2),
                  numPeopleFreeEntrance: parseInt(numPeopleFreeEntrance),
                  urls: '',
                  status: 'available',
               });

               // // after adding make storage ref with roomDocument document id
               const imageFile = images[0];
               const storageRef = ref(storage, `rooms/${roomDocument.id}/${imageFile.name}`);
               const uploadTask = uploadBytesResumable(storageRef, imageFile);

               uploadTask.on(
                  'state_changed',
                  snapshot => {},
                  err => console.error(err),
                  () => {
                     //  get the download URL then update the added room document
                     getDownloadURL(storageRef).then(async downloadURL => {
                        await updateDoc(doc(db, 'rooms', roomDocument.id), {
                           urls: downloadURL,
                        });

                        reset();
                        setIsUploading(false);
                        toast.success('Room added successfully!');
                     });
                  }
               );
            } else if (images.length > 1) {
               setIsUploading(true);
               const uploadPromises = [];
               const getDownloadLinksPromises = [];

               const roomDocument = await addDoc(collection(db, 'rooms'), {
                  name,
                  numSingleBed: parseInt(numSingleBed),
                  numKingBed: parseInt(numKingBed),
                  capacity: parseInt(capacity),
                  price: parseFloat(price).toFixed(2),
                  numPeopleFreeEntrance: parseInt(numPeopleFreeEntrance),
                  urls: '',
                  status: 'available',
               });

               images.forEach(imageFile => {
                  // // after adding make storage ref with roomDocument document id
                  const storageRef = ref(storage, `rooms/${roomDocument.id}/${imageFile.name}`);
                  const uploadTask = uploadBytesResumable(storageRef, imageFile);
                  uploadPromises.push(uploadTask);

                  uploadTask.on(
                     'state_changed',
                     snapshot => {},
                     err => console.error(err),
                     () => {
                        //  stored the getDownloadURL promises in an array
                        const downloadURL = getDownloadURL(storageRef);
                        getDownloadLinksPromises.push(downloadURL);
                     }
                  );
               });

               // promise.all that will resolve when all the inputted promises has been resolved
               Promise.all([...uploadPromises, ...getDownloadLinksPromises]).then(async () => {
                  // a promise that will resolve after all the download url is stored in an array
                  const promise = new Promise((resolve, reject) => {
                     const imageURLs = [];

                     getDownloadLinksPromises.forEach(async (getDownloadLinkPromise, index) => {
                        const URL = await getDownloadLinkPromise;
                        imageURLs.push(URL);

                        if (getDownloadLinksPromises.length - 1 === index) {
                           resolve(imageURLs);
                        }
                     });
                  });

                  // get the reolve value of the promise which is the array of download URL then use it to update the room's document
                  promise.then(URLS => {
                     updateDoc(doc(db, 'rooms', roomDocument.id), {
                        urls: URLS,
                     });
                  });

                  reset();
                  setIsUploading(false);
                  toast.success('Room added successfully!');
               });
            }
         } else {
            toast.error('Please complete all required fields.');
         }
      } catch (err) {
         console.error(err);
      }
   };

   const [capacityLimit] = useState(populateArray(50));

   return (
      <div className='d-flex flex-column mx-4 my-5 px-5 py-4'>
         {!isUploading ? (
            <form ref={formRef} className='needs-validation d-flex justify-content-between flex-column flex-lg-row' noValidate>
               <div>
                  <div className='mb-4'>
                     <input
                        value={name}
                        type='text'
                        className='form-control form-control-group-style rounded-style'
                        id='name'
                        name='name'
                        placeholder='Room Name'
                        required
                        onChange={handleInputChange}
                     />
                     {!name && <div className='invalid-feedback py-1 px-1'>Name can't be empty</div>}
                  </div>
                  <div className='mb-4'>
                     <input
                        value={numSingleBed}
                        type='number'
                        className='form-control form-control-group-style rounded-style'
                        id='number-single-bed'
                        name='numSingleBed'
                        placeholder='Number of Single Bed'
                        required
                        onChange={handleInputChange}
                     />
                     {!numSingleBed && <div className='invalid-feedback py-1 px-1'>Number of single bed can't be empty</div>}
                  </div>
                  <div className='mb-4'>
                     <input
                        value={numKingBed}
                        type='number'
                        className='form-control form-control-group-style rounded-style'
                        id='number-king-bed'
                        name='numKingBed'
                        placeholder='Number of King Bed'
                        required
                        onChange={handleInputChange}
                     />
                     {!numKingBed && <div className='invalid-feedback py-1 px-1'>Number of king bed can't be empty</div>}
                  </div>
                  <div className='row mb-4 align-items-center'>
                     <div className='col-2'>
                        <label htmlFor='#images text-secondary'>Room Photo</label>
                     </div>
                     <div className='col-10'>
                        <input
                           ref={fileRef}
                           type='file'
                           className='form-control form-control-group-style rounded-style'
                           id='images'
                           name='images'
                           placeholder='Number of King Bed'
                           required
                           multiple
                           accept='image/png, image/jpeg'
                           onChange={handleSelectedImages}
                        />
                        {images.length === 0 && <div className='invalid-feedback py-1 px-1'>Room photo/s can't be empty</div>}
                     </div>
                  </div>
               </div>
               <div className='d-flex flex-column ms-lg-5 flex-grow-1'>
                  <div className='mb-4'>
                     <select
                        value={capacity}
                        className='form-select form-control-group-style rounded-style'
                        required
                        name='capacity'
                        id='capacity'
                        onChange={handleInputChange}
                     >
                        <option value=''>Select a room capacity</option>
                        {capacityLimit &&
                           capacityLimit.map((number, index) => (
                              <option key={index} value={number}>
                                 {number}
                              </option>
                           ))}
                     </select>

                     {!capacity && <div className='invalid-feedback py-1 px-1'>Capacity can't be empty</div>}
                  </div>
                  <div className='mb-4'>
                     <input
                        value={price}
                        type='number'
                        className='form-control form-control-group-style rounded-style'
                        id='price'
                        name='price'
                        placeholder='Price Per Night'
                        required
                        onChange={handleInputChange}
                     />
                     {!price && <div className='invalid-feedback py-1 px-1'>Price can't be empty</div>}
                  </div>
                  <div className='mb-4'>
                     <input
                        value={numPeopleFreeEntrance}
                        type='number'
                        className='form-control form-control-group-style rounded-style'
                        id='numPeopleFreeEntrance'
                        name='numPeopleFreeEntrance'
                        placeholder='# of People for Free Entrance Fee'
                        required
                        onChange={handleInputChange}
                     />
                     {!numPeopleFreeEntrance && <div className='invalid-feedback py-1 px-1'>'# of people for free intrance fee can't be empty</div>}
                  </div>
                  <div className='align-self-end mt-auto'>
                     <button
                        type='button'
                        className='btn btn-primary py-2 px-4 rounded-style'
                        data-bs-toggle='modal'
                        data-bs-target='#addRoom-confirm-modal'
                     >
                        Add
                     </button>
                  </div>
               </div>
            </form>
         ) : (
            <div className='spinner-border text-primary spinner-lg mb-3 align-self-center justify-content-center' role='status'></div>
         )}

         {/* Modal add room */}
         <Modal target='addRoom-confirm-modal'>
            <div className='d-flex flex-column justify-content-center mt-5 mb-2 mx-3'>
               <div>
                  <RiErrorWarningLine className='text-danger warning-icon me-2' />
                  Are you sure you're going to add this room?
               </div>
               <div className='mt-5 align-self-end'>
                  <button className='btn btn-secondary py-2 px-4 rounded-style me-3' data-bs-dismiss='modal'>
                     Cancel
                  </button>
                  <button className='btn btn-primary py-2 px-4 rounded-style' data-bs-dismiss='modal' onClick={handleSubmit}>
                     Confirm
                  </button>
               </div>
            </div>
         </Modal>
      </div>
   );
};

export default AddRoom;

import { useState, useEffect, useCallback, Fragment } from 'react';
import Footer from './Footer';
import Header from './Header';
import { db } from '../firebase';
import { query, onSnapshot, collection, where, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import ImgViewer from './ImgViewer';
import Pagination from './Pagination';

const Rooms = () => {
   const [rooms, setRooms] = useState([]);
   const [error, setError] = useState(null);
   const [isLoading, setIsLoading] = useState(true);

   const [currentImage, setCurrentImage] = useState(0);
   const [isViewerOpen, setIsViewerOpen] = useState(false);
   const [selectedRoom, setSelectedRoom] = useState('');

   const itemPerPage = 4;
   const [pageNumber, setPageNumber] = useState(0);
   const pageVisited = pageNumber * itemPerPage;

   const openImageViewer = useCallback((index, id) => {
      setCurrentImage(index);
      setIsViewerOpen(true);
      setSelectedRoom(id);
   }, []);

   const closeImageViewer = () => {
      setCurrentImage(0);
      setIsViewerOpen(false);
   };

   useEffect(() => {
      const q = query(collection(db, 'rooms'), where('status', 'in', ['available', 'occupied']), orderBy('name', 'asc'));
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
      <>
         <Header />
         <div className={`d-flex flex-column shadow rounded container mt-4 mb-5 ${!isLoading ? 'py-4 pb-0' : 'p-5'}`}>
            {!isLoading && error && <div className='text-center my-5'>{error}</div>}
            {!isLoading && rooms ? (
               <Fragment>
                  <div className='row justify-content-center flex-wrap p-0 gy-2'>
                     {rooms
                        .slice(pageVisited, pageVisited + itemPerPage)
                        .map(({ id, name, capacity, numSingleBed, numKingBed, numPeopleFreeEntrance, price, urls }, index) => (
                           <div className='room-container d-flex m-3 px-0 rounded-style border border-1 border-start-0' key={index}>
                              <div>
                                 <div className='thumbnail-container m-0'>
                                    <img className='room-thumbnail' src={urls[0]} alt='room-thumbnail' />
                                 </div>
                                 <div className='sub-images-container'>
                                    {urls.map((src, index) => (
                                       <img
                                          key={index}
                                          className={`sub-image ${index > 2 && 'd-none'}`}
                                          src={src}
                                          onClick={() => openImageViewer(index, id)}
                                          alt='room'
                                          style={{ cursor: 'pointer' }}
                                       />
                                    ))}

                                    {/* modified simple-image-viewer */}
                                    <ImgViewer
                                       id={id}
                                       src={urls}
                                       selectedRoom={selectedRoom}
                                       isViewerOpen={isViewerOpen}
                                       currentImage={currentImage}
                                       closeImageViewer={closeImageViewer}
                                    />
                                 </div>
                              </div>
                              <div className='mx-4 m-2'>
                                 <div className='d-flex justify-content-between align-items-center'>
                                    <div>
                                       <strong>{name}</strong>
                                    </div>
                                    <div className='bg-danger-dark me-2 mt-2 ps-2 pe-3 py-2 rounded-style'>
                                       <span className='fs-5 m-1'>₱</span>
                                       {price}
                                    </div>
                                 </div>
                                 <div>
                                    <div>
                                       Capacity: <strong>{capacity}</strong>
                                    </div>
                                    <div className='my-1 text-nowrap'>
                                       # of Single Bed: <strong>{numSingleBed}</strong>
                                    </div>
                                    <div className='my-1 text-nowrap'>
                                       # of King Bed: <strong>{numKingBed}</strong>
                                    </div>
                                    <div className='my-1 text-nowrap'>
                                       # of People for Free Entrance Fee: <strong>{numPeopleFreeEntrance}</strong>
                                    </div>
                                    <div>
                                       <Link className='btn btn-primary my-1 py-2 px-3 rounded-style' to={`/booking/${id}`}>
                                          Book Now
                                       </Link>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                  </div>
                  <div className='d-flex justify-content-center mt-2'>
                     <Pagination data={rooms} itemPerPage={itemPerPage} setPageNumber={setPageNumber} />
                  </div>
               </Fragment>
            ) : (
               <div className='align-self-center spinner-border text-primary spinner-lg' role='status'></div>
            )}
         </div>
         <Footer />
      </>
   );
};

export default Rooms;

import DashboardFooter from './DashboardFooter';
import StaffDashboardHeader from './StaffDashboardHeader';
import { db } from '../firebase';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AddRoom from './AddRoom';
import RoomList from './RoomList';
import BookingList from './BookingList';

const StaffDashboard = ({ user, onSetRole, onSetUser }) => {
   const navigate = useNavigate();
   const deleteAccount = async () => {
      const { uid } = user;
      await deleteDoc(doc(db, 'users', uid));

      deleteUser(user)
         .then(() => {
            onSetUser(null);
            navigate(0);
         })
         .catch(err => {
            console.error(err.message);
         });
   };

   return (
      <>
         <StaffDashboardHeader onDeleteAccount={deleteAccount} user={user} onSetRole={onSetRole} onSetUser={onSetUser} />

         <div className='shadow rounded container mt-4 mb-5 p-5'>
            <ul className='nav nav-tabs mb-4' role='tablist'>
               <li className='nav-item me-5' role='presentation'>
                  <button
                     className='nav-link text-dark active py-2'
                     id='booking-list-tab'
                     data-bs-toggle='tab'
                     data-bs-target='#booking-list'
                     type='button'
                     role='tab'
                  >
                     Booking List
                  </button>
               </li>
               <li className='nav-item me-5' role='presentation'>
                  <button className='nav-link text-dark' id='add-room-tab' data-bs-toggle='tab' data-bs-target='#add-room' type='button' role='tab'>
                     Add Room
                  </button>
               </li>
               <li className='nav-item me-5' role='presentation'>
                  <button className='nav-link text-dark' id='toom-list-tab' data-bs-toggle='tab' data-bs-target='#room-list' type='button' role='tab'>
                     Room List
                  </button>
               </li>
            </ul>
            <div className='tab-content border border-primary tab-content-rounded'>
               <div className='tab-pane fade show active p-4' id='booking-list' role='tabpanel'>
                  <BookingList user={user} />
               </div>
               <div className='tab-pane fade p-4' id='add-room' role='tabpanel'>
                  <AddRoom />
               </div>
               <div className='tab-pane fade p-4' id='room-list' role='tabpanel'>
                  <RoomList />
               </div>
            </div>
         </div>

         <DashboardFooter />
      </>
   );
};

export default StaffDashboard;

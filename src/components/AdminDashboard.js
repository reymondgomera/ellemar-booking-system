import DashboardFooter from './DashboardFooter';
import AdminDashboardHeader from './AdminDashboardHeader';
import AddUser from './AddUser';
import UserList from './UserList';

const AdminDashboard = ({ user, onSetRole, onSetUser }) => {
   return (
      <>
         <AdminDashboardHeader user={user} onSetRole={onSetRole} onSetUser={onSetUser} />

         <div className='shadow rounded container mt-4 mb-5 p-5'>
            <ul className='nav nav-tabs mb-4' role='tablist'>
               <li className='nav-item me-5' role='presentation'>
                  <button
                     className='nav-link text-dark active py-2'
                     id='add-user-tab'
                     data-bs-toggle='tab'
                     data-bs-target='#add-user'
                     type='button'
                     role='tab'
                  >
                     Add User
                  </button>
               </li>
               <li className='nav-item' role='presentation'>
                  <button className='nav-link text-dark' id='user-list-tab' data-bs-toggle='tab' data-bs-target='#user-list' type='button' role='tab'>
                     User List
                  </button>
               </li>
            </ul>
            <div className='tab-content border border-primary tab-content-rounded'>
               <div className='tab-pane fade show active px-4 py-2' id='add-user' role='tabpanel'>
                  <AddUser />
               </div>
               <div className='tab-pane fade p-4' id='user-list' role='tabpanel'>
                  <UserList />
               </div>
            </div>
         </div>

         <DashboardFooter />
      </>
   );
};

export default AdminDashboard;

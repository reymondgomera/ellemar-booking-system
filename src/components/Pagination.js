import ReactPaginate from 'react-paginate';

const Pagination = ({ data, setPageNumber, itemPerPage }) => {
   const pageCount = Math.ceil(data.length / itemPerPage);

   const changePage = ({ selected }) => {
      setPageNumber(selected);
   };

   return (
      data.length > 0 && (
         <ReactPaginate
            previousLabel='Previous'
            breakLabel='...'
            nextLabel='Next'
            pageCount={pageCount}
            onPageChange={changePage}
            containerClassName='pagination align-self-end'
            previousClassName='page-item'
            previousLinkClassName='page-link'
            nextClassName='page-item'
            nextLinkClassName='page-link'
            pageClassName='page-item'
            pageLinkClassName='page-link'
            breakClassName='page-item'
            breakLinkClassName='page-link'
            activeClassName='active'
         />
      )
   );
};

export default Pagination;

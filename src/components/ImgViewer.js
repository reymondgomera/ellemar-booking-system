import ImageViewer from 'react-simple-image-viewer';

const ImgViewer = ({ id, selectedRoom, src, isViewerOpen, currentImage, closeImageViewer }) => {
   return isViewerOpen && id === selectedRoom ? (
      <ImageViewer src={src} currentIndex={currentImage} disableScroll={false} closeOnClickOutside={true} onClose={closeImageViewer} />
   ) : null;
};

export default ImgViewer;

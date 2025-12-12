const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 z-[100] flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose} 
    >
      <div 
        className="relative max-w-4xl max-h-full" 
        onClick={(e) => e.stopPropagation()} 
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white text-3xl font-bold bg-gray-800 bg-opacity-50 p-2 rounded-full leading-none transition hover:bg-opacity-80"
          title="Close"
        >
          &times;
        </button>
        <img 
          src={imageUrl} 
          alt="Enlarged View" 
          className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl" 
        />
      </div>
    </div>
  );
};

export default ImageModal;
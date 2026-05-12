const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-3 border-gray-200 border-t-primary-600 rounded-full animate-spin`}
        style={{ borderWidth: 3 }} />
      {text && <p className="text-sm text-gray-500 animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
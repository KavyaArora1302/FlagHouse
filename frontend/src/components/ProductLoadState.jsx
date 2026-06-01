const ProductLoadState = ({ message = 'Loading products...' }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
    <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
    <p className="text-sm text-gray-500">{message}</p>
  </div>
);

export const ProductErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-4">
    <span className="text-4xl">⚠️</span>
    <h3 className="text-xl font-semibold text-gray-800">Could not load products</h3>
    <p className="text-sm text-gray-500 max-w-md">{message}</p>
    <p className="text-xs text-gray-400">
      Start the backend (<code className="text-gray-600">cd backend && npm start</code>) on port 5000.
    </p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 text-sm font-medium bg-black text-white px-5 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors"
      >
        Try again
      </button>
    )}
  </div>
);

export default ProductLoadState;

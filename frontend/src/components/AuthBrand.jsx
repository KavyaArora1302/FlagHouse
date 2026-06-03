import { Link } from 'react-router-dom';

const AuthBrand = () => (
  <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
    <div className="w-9 h-9 bg-black rounded-md flex items-center justify-center">
      <span className="text-white text-base font-bold leading-none">F</span>
    </div>
    <span className="text-2xl font-bold text-gray-900 tracking-tight">
      Flag<span className="font-normal text-gray-400">house</span>
    </span>
  </Link>
);

export default AuthBrand;

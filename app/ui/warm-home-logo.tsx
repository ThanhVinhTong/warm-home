import { HomeModernIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default function WarmHomeLogo() {
  return (
    <div className="flex items-center justify-center">
      {/* House Icon */}
      <div className="mr-3 p-2 bg-emerald-600 rounded-lg shadow-sm">
        <svg 
          className="w-8 h-8 text-white" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/>
        </svg>
      </div>
      
      {/* Text */}
      <div className="flex flex-col">
        <p className="text-xl font-bold text-white leading-tight">Warm</p>
        <p className="text-lg font-medium text-gray-300 leading-tight">Home</p>
      </div>
    </div>
  );
}

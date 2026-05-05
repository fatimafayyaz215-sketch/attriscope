import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <span className="text-[120px] font-black text-gray-100 select-none">404</span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center animate-bounce">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Page not found</h1>
      <p className="text-gray-500 text-base max-w-md mb-10">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <Link 
        href="/dashboard"
        className="px-10 py-4 bg-[#0a235c] hover:bg-black text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:scale-[1.02]"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

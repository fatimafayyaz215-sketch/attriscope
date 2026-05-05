export default function ForgotPasswordLeftPanel() {
  return (
    <div className="hidden lg:flex w-1/2 bg-blue-700 text-white flex-col justify-between p-12">
      <div>
        <div className="flex items-center gap-2 mb-16">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="font-bold text-xl tracking-tight">ChurnIQ</span>
        </div>

        <h1 className="text-4xl font-bold leading-tight mb-6 max-w-md">
          Don&apos;t lose your competitive edge.
        </h1>
        <p className="text-blue-100 text-sm leading-relaxed max-w-[480px]">
          Recover your account to continue predicting and preventing customer churn with our AI-driven insights. Your data-driven advantage is just a few steps away.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center relative my-12">
         {/* Graphic Placeholder */}
         <div className="w-full max-w-md aspect-[16/9] bg-blue-800/50 rounded-xl border border-blue-600/50 flex flex-col items-center justify-center p-8 backdrop-blur-sm relative overflow-hidden">
            {/* Abstract background circles */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
               <div className="w-[150%] h-[150%] border-[1px] border-blue-400 rounded-full absolute animate-[spin_60s_linear_infinite]" />
               <div className="w-[120%] h-[120%] border-[1px] border-blue-400 border-dashed rounded-full absolute animate-[spin_40s_linear_infinite_reverse]" />
               <div className="w-[90%] h-[90%] border-[1px] border-blue-400 rounded-full absolute animate-[spin_30s_linear_infinite]" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-blue-900/50 ring-4 ring-blue-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 11c0-1.105-1.343-2-3-2s-3 .895-3 2v2m6 0v2m-6-2h6v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-xs tracking-[0.2em] font-medium text-blue-200 uppercase">
                Secure Recovery Environment
              </p>
            </div>
         </div>
      </div>

      <div className="text-xs text-blue-300 tracking-widest uppercase font-semibold">
        Authorized Access Only
      </div>
    </div>
  );
}

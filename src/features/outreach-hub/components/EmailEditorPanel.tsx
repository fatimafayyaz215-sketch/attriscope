"use client";

import { useState } from "react";

export default function EmailEditorPanel() {
  const [emailBody, setEmailBody] = useState(
`Hi Sarah,

I've been reviewing the account activity for Acme Corp. and noticed that usage across your engineering seats has dipped slightly over the last few weeks. I also saw that you have a couple of pending support tickets regarding the data ingestion latency.

I want to ensure you're getting the full value out of ChurnGuard. I've personally escalated those support tickets to our senior engineering team, and they should be resolved by end-of-day tomorrow.

Would you have 10 minutes this Friday to discuss your current implementation? I'd love to share some of the new predictive modeling features we just launched that could help your team regain visibility on those high-value segments.

Best regards,
Alex Chen
Senior Success Manager, ChurnGuard`
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-[calc(100vh-120px)] lg:h-[800px]">
      
      {/* AI Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-[#fafbfe] rounded-t-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-4 items-start">
          <div className="text-blue-600 mt-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-0.5">AI-Drafted Outreach</h2>
            <p className="text-xs text-gray-500">Personalized based on usage decline and open support tickets</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm text-left">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Tone:<br/>Professional</span>
          </button>
        </div>
      </div>

      {/* Email Headers */}
      <div className="border-b border-gray-100 flex flex-col">
        <div className="flex items-center border-b border-gray-50 px-6 py-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-20 shrink-0">To</span>
          <input 
            type="text" 
            defaultValue="sarah.johnson@acmecorp.com"
            className="flex-1 text-sm text-gray-900 focus:outline-none bg-transparent font-medium"
          />
        </div>
        <div className="flex items-center px-6 py-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-20 shrink-0">Subject</span>
          <input 
            type="text" 
            defaultValue="Maximizing your ChurnGuard enterprise value — quick check-in"
            className="flex-1 text-sm text-gray-900 focus:outline-none bg-transparent font-medium"
          />
        </div>
      </div>

      {/* Email Body */}
      <div className="flex-1 p-6 overflow-y-auto">
        <textarea 
          value={emailBody}
          onChange={(e) => setEmailBody(e.target.value)}
          className="w-full h-full resize-none text-sm text-gray-800 leading-relaxed focus:outline-none bg-transparent"
          spellCheck={false}
        />
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-xl">
        
        {/* Formatting Tools Placeholder */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <button className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-sm font-bold">B</button>
          <button className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-sm font-serif italic">I</button>
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <button className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          </button>
          <button className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Auto-saved at 2:45 PM
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              Save Draft
            </button>
            <button className="px-6 py-2.5 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2">
              Send Email
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

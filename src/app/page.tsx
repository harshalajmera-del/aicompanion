'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAriaChat } from '@/hooks/use-aria-chat';
import { ChatPanel } from '@/components/chat/chat-panel';
import { MemorySidebar } from '@/components/layout/memory-sidebar';
import { AriaHeader } from '@/components/layout/aria-header';
import { TripSummaryView } from '@/components/booking/trip-summary';
import { WeatherOverlay } from '@/components/weather/weather-overlay';
import type { WeatherCondition } from '@/types/itinerary';

export default function AriaApp() {
  const chat = useAriaChat();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showSummary, setShowSummary] = React.useState(false);

  // Derive ambient weather from latest itinerary day
  const ambientCondition: WeatherCondition =
    chat.itinerary?.days[0]?.weather?.condition ?? 'partly_cloudy';

  // Auto-show summary when stage reaches trip_summary
  React.useEffect(() => {
    if (chat.stage === 'trip_summary' && chat.tripSummary) {
      setShowSummary(true);
    }
  }, [chat.stage, chat.tripSummary]);

  return (
    <WeatherOverlay condition={ambientCondition} className="min-h-screen aria-gradient">
      {/* Background aurora */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-aria opacity-95" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      {/* App shell */}
      <div className="relative z-10 flex h-screen overflow-hidden">

        {/* Sidebar — desktop always visible, mobile overlay */}
        <>
          {/* Mobile overlay backdrop */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-20 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </AnimatePresence>

          <motion.div
            className={`
              fixed lg:relative inset-y-0 left-0 z-30 lg:z-auto
              w-72 flex-shrink-0
              transform lg:transform-none transition-transform duration-300
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            <MemorySidebar
              trip={chat.trip}
              profile={chat.profile}
              stage={chat.stage}
              onReset={() => { chat.resetSession(); setSidebarOpen(false); }}
              className="h-full"
            />
          </motion.div>
        </>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Header */}
          <AriaHeader
            stage={chat.stage}
            destination={chat.trip.destination}
            onMenuToggle={() => setSidebarOpen(prev => !prev)}
            sidebarOpen={sidebarOpen}
          />

          {/* Chat + optional summary panel */}
          <div className="flex-1 flex overflow-hidden">

            {/* Chat panel */}
            <div className={`flex-1 overflow-hidden transition-all duration-300 ${showSummary && chat.tripSummary ? 'lg:w-1/2' : 'w-full'}`}>
              <ChatPanel
                messages={chat.messages}
                stage={chat.stage}
                isLoading={chat.isLoading}
                onSend={chat.sendMessage}
                onQuickReply={chat.handleQuickReply}
                onApproveItinerary={chat.approveItinerary}
                onEditItinerary={chat.editItinerary}
                onSelectFlight={chat.selectFlight}
                onSelectHotel={chat.selectHotel}
                onSelectActivity={chat.toggleActivity}
              />
            </div>

            {/* Trip summary side panel (desktop) */}
            <AnimatePresence>
              {showSummary && chat.tripSummary && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="hidden lg:block w-96 flex-shrink-0 border-l border-slate-100 bg-slate-50 overflow-y-auto p-4 scrollbar-thin"
                >
                  <TripSummaryView
                    summary={chat.tripSummary}
                    onCheckout={() => {
                      chat.sendMessage('I\'m ready to confirm the booking!');
                    }}
                    onEdit={() => setShowSummary(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Finish booking CTA — shown when activities selected and no summary yet */}
          {chat.selectedActivities.length > 0 && !showSummary && chat.stage === 'select_activities' && (
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="border-t border-slate-100 bg-white p-3 flex items-center justify-between gap-3"
            >
              <div className="text-sm">
                <span className="font-semibold text-slate-700">{chat.selectedActivities.length} activit{chat.selectedActivities.length === 1 ? 'y' : 'ies'} selected</span>
                <span className="text-slate-400 ml-2">Ready to see your full trip?</span>
              </div>
              <button
                onClick={chat.buildTripSummary}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors shadow-md"
              >
                View trip summary →
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </WeatherOverlay>
  );
}

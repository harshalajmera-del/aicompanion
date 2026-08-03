'use client';
import * as React from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import type { ChatMessage, QuickReply, ConversationStage } from '@/types/conversation';
import type { FlightOffer } from '@/types/flight';
import type { HotelOffer } from '@/types/hotel';
import type { ActivityOffer } from '@/types/activity';
import { ItineraryView } from '@/components/itinerary/itinerary-view';
import { FlightResults } from '@/components/search/flight-results';
import { HotelResults } from '@/components/search/hotel-results';
import { ActivityResults } from '@/components/search/activity-results';

interface ChatPanelProps {
  messages: ChatMessage[];
  stage: ConversationStage;
  isLoading: boolean;
  onSend: (message: string) => void;
  onQuickReply: (reply: QuickReply) => void;
  onApproveItinerary?: () => void;
  onEditItinerary?: (change: string) => void;
  onSelectFlight?: (flight: FlightOffer) => void;
  onSelectHotel?: (hotel: HotelOffer) => void;
  onSelectActivity?: (activity: ActivityOffer) => void;
}

export function ChatPanel({
  messages, stage, isLoading, onSend, onQuickReply,
  onApproveItinerary, onEditItinerary, onSelectFlight, onSelectHotel, onSelectActivity,
}: ChatPanelProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadingMsg: ChatMessage = {
    id: 'loading',
    role: 'assistant',
    content: '',
    type: 'loading',
    timestamp: new Date(),
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <React.Fragment key={msg.id}>
              <MessageBubble message={msg} onQuickReply={onQuickReply} />

              {/* Inline rich content attached to messages */}
              {msg.metadata?.itinerary && (
                <div className="ml-10">
                  <ItineraryView
                    itinerary={msg.metadata.itinerary}
                    onApprove={onApproveItinerary}
                    onEdit={onEditItinerary}
                  />
                </div>
              )}
              {msg.metadata?.flights && msg.metadata.flights.length > 0 && (
                <div className="ml-10">
                  <FlightResults flights={msg.metadata.flights} onSelect={onSelectFlight} />
                </div>
              )}
              {msg.metadata?.hotels && msg.metadata.hotels.length > 0 && (
                <div className="ml-10">
                  <HotelResults hotels={msg.metadata.hotels} onSelect={onSelectHotel} />
                </div>
              )}
              {msg.metadata?.activities && msg.metadata.activities.length > 0 && (
                <div className="ml-10">
                  <ActivityResults activities={msg.metadata.activities} onSelect={onSelectActivity} />
                </div>
              )}
            </React.Fragment>
          ))}

          {isLoading && <MessageBubble key="loading" message={loadingMsg} />}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <ChatInput
        onSend={onSend}
        disabled={isLoading}
        placeholder={getStagePlaceholder(stage)}
      />
    </div>
  );
}

function getStagePlaceholder(stage: ConversationStage): string {
  switch (stage) {
    case 'greeting':
    case 'discover': return 'Where would you like to go?';
    case 'narrow_destination': return 'Which area interests you most?';
    case 'collecting_details': return 'Type your answer or pick an option above…';
    case 'refine_itinerary':
    case 'approve_itinerary': return 'Looks good, or ask for changes…';
    case 'search_flights':
    case 'select_flight': return 'Which flight would you like?';
    case 'search_hotels':
    case 'select_hotel': return 'Which hotel catches your eye?';
    default: return 'Message Aria…';
  }
}

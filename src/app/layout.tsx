import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Aria — AI Travel Consultant',
  description: 'Your personal AI travel consultant. Discover destinations, plan personalised itineraries, and book flights, hotels & activities — all in one seamless conversation.',
  keywords: ['AI travel', 'travel planner', 'itinerary generator', 'flight booking', 'hotel search'],
  authors: [{ name: 'Aria AI' }],
  openGraph: {
    title: 'Aria — AI Travel Consultant',
    description: 'Plan your perfect trip with Aria, your AI travel consultant.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', fontSize: '13px' },
          }}
        />
      </body>
    </html>
  );
}

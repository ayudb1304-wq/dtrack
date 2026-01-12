'use client';

import { useState } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { AddDateModal } from '@/components/AddDateModal';
import { ToastProvider } from '@/components/ui/Toast';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[var(--background)]">
        <main className="pb-28">
          {children}
        </main>
        <BottomNav onAddClick={() => setShowAddModal(true)} />
        <AddDateModal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
        />
      </div>
    </ToastProvider>
  );
}

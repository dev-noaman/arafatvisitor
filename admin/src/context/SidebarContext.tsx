import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen(prev => !prev);
  };

  const value: SidebarContextType = {
    isOpen,
    toggle,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

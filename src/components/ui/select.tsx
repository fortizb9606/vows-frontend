'use client';
import React, { createContext, useContext, useState } from 'react';

interface SelectContextType { open: boolean; setOpen: (o: boolean) => void; value: string; setValue: (v: string) => void; }
const SelectContext = createContext<SelectContextType | undefined>(undefined);
const useSelect = () => { const c = useContext(SelectContext); if (!c) throw new Error('Must be in Select'); return c; };

const Select = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value?: string; onValueChange?: (v: string) => void; open?: boolean; onOpenChange?: (o: boolean) => void }>(
  ({ value: cv = '', onValueChange, open: co, onOpenChange, children, ...props }, ref) => {
    const [iv, siv] = useState(cv); const [io, sio] = useState(false);
    const value = cv !== '' ? cv : iv; const open = co !== undefined ? co : io;
    const setValue = (v: string) => { if (cv === '') siv(v); onValueChange?.(v); };
    const setOpen = (o: boolean) => { if (co === undefined) sio(o); onOpenChange?.(o); };
    return <SelectContext.Provider value={{ open, setOpen, value, setValue }}><div ref={ref} className="relative" {...props}>{children}</div></SelectContext.Provider>;
  }
);
Select.displayName = 'Select';

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, onClick, className = '', ...props }, ref) => {
    const { open, setOpen } = useSelect();
    return <button ref={ref} onClick={(e) => { setOpen(!open); onClick?.(e); }} className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props}>{children}</button>;
  }
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder = 'Select...' }) => { const { value } = useSelect(); return <span>{value || placeholder}</span>; };
SelectValue.displayName = 'SelectValue';

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => { const { open } = useSelect(); if (!open) return null; return <div ref={ref} className={`absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg ${className}`} {...props}>{children}</div>; }
);
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }>(
  ({ value, children, onClick, className = '', ...props }, ref) => {
    const { setValue, setOpen } = useSelect();
    return <button ref={ref} onClick={(e) => { setValue(value); setOpen(false); onClick?.(e); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer ${className}`} {...props}>{children}</button>;
  }
);
SelectItem.displayName = 'SelectItem';

const SelectGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>);
SelectGroup.displayName = 'SelectGroup';

const SelectLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className = '', ...props }, ref) => <div ref={ref} className={`px-3 py-2 text-sm font-semibold text-gray-600 ${className}`} {...props} />);
SelectLabel.displayName = 'SelectLabel';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel };

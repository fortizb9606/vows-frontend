'use client';
import React, { createContext, useContext, useState } from 'react';
import { Button } from './button';

interface AlertDialogContextType { open: boolean; setOpen: (open: boolean) => void; }
const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined);

const AlertDialog: React.FC<{ open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }> = ({ open: controlledOpen, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => { if (controlledOpen === undefined) setInternalOpen(v); onOpenChange?.(v); };
  return <AlertDialogContext.Provider value={{ open, setOpen }}>{children}</AlertDialogContext.Provider>;
};

const useAlertDialog = () => { const c = useContext(AlertDialogContext); if (!c) throw new Error('Must be in AlertDialog'); return c; };

const AlertDialogTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
  ({ asChild, children, onClick, ...props }, ref) => {
    const { setOpen } = useAlertDialog();
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { setOpen(true); onClick?.(e); };
    if (asChild && React.isValidElement(children)) return React.cloneElement(children as React.ReactElement<any>, { onClick: handleClick });
    return <button ref={ref} onClick={handleClick} {...props}>{children}</button>;
  }
);
AlertDialogTrigger.displayName = 'AlertDialogTrigger';

const AlertDialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    const { open, setOpen } = useAlertDialog();
    if (!open) return null;
    return <><div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)} /><div ref={ref} className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border border-gray-200 bg-white p-6 rounded-lg shadow-lg" {...props}>{children}</div></>;
  }
);
AlertDialogContent.displayName = 'AlertDialogContent';

const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => <h2 ref={ref} className={`text-lg font-semibold ${className}`} {...props} />
);
AlertDialogTitle.displayName = 'AlertDialogTitle';

const AlertDialogDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`text-sm text-gray-600 mt-2 ${className}`} {...props} />
);
AlertDialogDescription.displayName = 'AlertDialogDescription';

const AlertDialogAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ ...props }, ref) => { const { setOpen } = useAlertDialog(); return <Button ref={ref} onClick={(e) => { setOpen(false); props.onClick?.(e); }} {...props} />; }
);
AlertDialogAction.displayName = 'AlertDialogAction';

const AlertDialogCancel = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ ...props }, ref) => { const { setOpen } = useAlertDialog(); return <Button ref={ref} variant="outline" onClick={(e) => { setOpen(false); props.onClick?.(e); }} {...props} />; }
);
AlertDialogCancel.displayName = 'AlertDialogCancel';

export { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel };

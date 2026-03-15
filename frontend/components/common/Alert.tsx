import { ReactNode } from 'react';
import clsx from 'clsx';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'error' | 'info';
  children: ReactNode;
  className?: string;
}

export default function Alert({ type = 'info', children, className }: AlertProps) {
  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  return (
    <div className={clsx('flex items-start gap-3 p-4 rounded-lg border', styles[type], className)}>
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}

export default function Spinner({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div className={`border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin ${className}`} />
  );
}

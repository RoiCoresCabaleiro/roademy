export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-white p-6 rounded-2xl shadow-soft ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div
      className={`flex justify-between items-center mb-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h2
      className={`text-xl font-semibold text-neutral-800 ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
}

export function CardDescription({ children, className = "", ...props }) {
  return (
    <p className={`text-sm text-neutral-600 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }) {
  return (
    <div className={`mt-6 flex justify-end space-x-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

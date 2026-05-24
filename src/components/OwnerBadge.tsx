/**
 * Owner Badge Component
 * Displays a special badge for the owner of BinghamHub
 */

interface OwnerBadgeProps {
  isOwner: boolean;
  showTooltip?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function OwnerBadge({ isOwner, showTooltip = true, size = "md" }: OwnerBadgeProps) {
  if (!isOwner) return null;

  const sizeClasses = {
    sm: "w-4 h-4 text-xs",
    md: "w-5 h-5 text-sm",
    lg: "w-6 h-6 text-base",
  };

  return (
    <div className="relative group inline-block">
      <div
        className={`${sizeClasses[size]} bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center font-bold text-white cursor-help`}
        title="BinghamHub Founder"
      >
        ★
      </div>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-yellow-500/30">
          This account belongs to the founder of BinghamHub
        </div>
      )}
    </div>
  );
}

import { Star } from "lucide-react";
import { useState } from "react";

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
};

const sizeMap = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };

export function StarRating({ value, onChange, size = "md", readonly = false }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
        >
          <Star
            className={`${sizeMap[size]} transition-colors ${
              star <= display
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

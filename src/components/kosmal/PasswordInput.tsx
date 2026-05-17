import { useState, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof Input>;

export const PasswordInput = forwardRef<HTMLInputElement, Props>(({ className, ...props }, ref) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input ref={ref} {...props} type={show ? "text" : "password"} className={cn("pr-10", className)} />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Sembunyikan password" : "Lihat password"}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export function emailProviderUrl(email: string): string {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    "gmail.com": "https://mail.google.com",
    "googlemail.com": "https://mail.google.com",
    "yahoo.com": "https://mail.yahoo.com",
    "yahoo.co.id": "https://mail.yahoo.com",
    "outlook.com": "https://outlook.live.com/mail",
    "hotmail.com": "https://outlook.live.com/mail",
    "live.com": "https://outlook.live.com/mail",
    "icloud.com": "https://www.icloud.com/mail",
    "proton.me": "https://mail.proton.me",
    "protonmail.com": "https://mail.proton.me",
  };
  return map[domain] ?? `https://${domain}`;
}
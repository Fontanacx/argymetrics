"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, RotateCcw } from "lucide-react";
import { useState } from "react";

export function DatePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentParam = searchParams.get("date");
  
  // Format today strictly in Argentina Timezone to prevent TZ shifts (YYYY-MM-DD)
  const getArgDate = () => {
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date());
  };
  
  const today = getArgDate();
  const [date, setDate] = useState(currentParam || today);

  const setAndNavigate = (newDate: string) => {
    // Prevent selecting future dates manually
    if (newDate > today) newDate = today;
    
    setDate(newDate);
    // If the selected date is today, remove the param to fetch fresh live data
    if (newDate === today || !newDate) {
      router.push("/insights");
    } else {
      router.push(`/insights?date=${newDate}`);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAndNavigate(e.target.value);
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className="flex items-center gap-2 rounded-lg border px-3 py-1.5 shadow-sm transition-colors focus-within:ring-2"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <Calendar size={16} style={{ color: "var(--text-muted)" }} />
        <input 
          type="date" 
          value={date}
          max={today}
          min="2023-01-01" // Reasonable lookback limit
          onChange={handleDateChange}
          onClick={(e) => {
            // Some browsers open the picker on click anywhere in the input
            (e.target as HTMLInputElement).showPicker?.();
          }}
          className="bg-transparent text-sm font-medium outline-none cursor-pointer"
          style={{
            color: currentParam ? "var(--color-accent)" : "var(--text-primary)",
            colorScheme: "dark" // ensures the browser date picker adapts to dark mode if supported
          }}
        />
      </div>
      
      {currentParam && currentParam !== today && (
        <button
          onClick={() => setAndNavigate(today)}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all hover:opacity-80 shadow-sm"
          style={{
            borderColor: "var(--color-accent)",
            color: "var(--color-accent)",
            background: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
          }}
        >
          <RotateCcw size={12} />
          HOY
        </button>
      )}
    </div>
  );
}

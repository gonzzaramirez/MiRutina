"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;

  closeOnSelect?: boolean;
}

export default function DatePicker({
  date,
  onDateChange,
  placeholder = "Seleccionar fecha",
  disabled = false,
  className,
  closeOnSelect = true,
}: DatePickerProps) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    date
  );

  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setInternalDate(date);
  }, [date]);

  function handleSelect(selected: Date | Date[] | undefined) {
    let newDate: Date | undefined;

    if (Array.isArray(selected)) {
      newDate = selected[0] as Date | undefined;
    } else {
      newDate = selected as Date | undefined;
    }

    setInternalDate(newDate);
    onDateChange?.(newDate);

    if (closeOnSelect) {
      setOpen(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !internalDate && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {internalDate ? (
            format(internalDate, "PPP", { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={internalDate}
          onSelect={handleSelect}
          initialFocus
          locale={es}
        />

        <div className="flex gap-2 items-center justify-end p-2">
          <Button size="sm" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

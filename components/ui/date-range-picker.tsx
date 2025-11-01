"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import { th } from "date-fns/locale" // 👈 เพิ่ม import ภาษาไทย
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}

export function DatePickerWithRange({
  className,
  date,
  setDate // 👈 รับ props date และ setDate เข้ามา
}: DatePickerWithRangeProps) {
  
  return (
    <div className={cn("grid gap-2", className= " text-black")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y", { locale: th })} -{" "}
                  {format(date.to, "LLL dd, y", { locale: th })}
                </>
              ) : (
                format(date.from, "LLL dd, y", { locale: th })
              )
            ) : (
              <span>เลือกช่วงวันที่</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate} // 👈 ใช้ setDate ที่รับมาจาก props
            numberOfMonths={2}
            locale={th} // 👈 ตั้งค่าภาษาไทย
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
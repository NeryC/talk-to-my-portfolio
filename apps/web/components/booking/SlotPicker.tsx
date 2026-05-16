"use client";

import { Button } from "@/components/ui/button";

export interface BookingSlot {
  id: string;
  /** ISO-8601 start timestamp. */
  start: string;
  /** ISO-8601 end timestamp. */
  end: string;
  /** Optional human label override. */
  label?: string;
}

interface Props {
  slots: BookingSlot[];
  onSelect: (slotId: string) => void;
  selectedId?: string;
}

/**
 * Groups slots by their local day and renders a clickable grid per day.
 */
export function SlotPicker({ slots, onSelect, selectedId }: Props) {
  const grouped = groupByDay(slots);

  if (grouped.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No available times.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {grouped.map(({ day, items }) => (
        <div key={day} className="flex flex-col gap-2">
          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {day}
          </h4>
          <div className="flex flex-wrap gap-2">
            {items.map((slot) => (
              <Button
                key={slot.id}
                size="sm"
                variant={selectedId === slot.id ? "default" : "outline"}
                onClick={() => onSelect(slot.id)}
              >
                {slot.label ?? formatTime(slot.start)}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupByDay(
  slots: BookingSlot[],
): Array<{ day: string; items: BookingSlot[] }> {
  const map = new Map<string, BookingSlot[]>();
  for (const slot of slots) {
    const key = formatDay(slot.start);
    const arr = map.get(key) ?? [];
    arr.push(slot);
    map.set(key, arr);
  }
  return Array.from(map.entries()).map(([day, items]) => ({ day, items }));
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

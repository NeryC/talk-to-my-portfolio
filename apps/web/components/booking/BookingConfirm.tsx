import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

interface Props {
  bookingId: string;
  confirmationUrl?: string;
  /** Title shown in the calendar event. */
  title: string;
  /** ISO-8601 start timestamp. */
  start: string;
  /** ISO-8601 end timestamp. */
  end: string;
  description?: string;
  location?: string;
}

/**
 * Confirmation screen after booking. Renders an ICS download link as a
 * data URL — Google / Outlook calendar deep links are deferred.
 */
export function BookingConfirm({
  bookingId,
  confirmationUrl,
  title,
  start,
  end,
  description,
  location,
}: Props) {
  const icsHref = buildIcsDataUrl({ title, start, end, description, location });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Check className="size-3" />
          </span>
          Booking confirmed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <div className="text-muted-foreground">Booking ID</div>
          <div className="font-mono text-xs">{bookingId}</div>
        </div>
        <div>
          <div className="text-muted-foreground">When</div>
          <div>{formatRange(start, end)}</div>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild size="sm" variant="outline">
            <a href={icsHref} download={`${bookingId}.ics`}>
              Add to calendar (.ics)
            </a>
          </Button>
          {confirmationUrl ? (
            <Button asChild size="sm">
              <a href={confirmationUrl} target="_blank" rel="noreferrer">
                View confirmation
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function formatRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleString()} — ${e.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function buildIcsDataUrl(opts: {
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
}): string {
  const dt = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, "");
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//talk-to-my-portfolio//EN",
    "BEGIN:VEVENT",
    `UID:${dt(opts.start)}-${Math.random().toString(36).slice(2, 10)}`,
    `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${dt(opts.start)}`,
    `DTEND:${dt(opts.end)}`,
    `SUMMARY:${esc(opts.title)}`,
    opts.description ? `DESCRIPTION:${esc(opts.description)}` : null,
    opts.location ? `LOCATION:${esc(opts.location)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}

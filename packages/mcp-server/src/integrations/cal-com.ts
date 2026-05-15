export interface CalComClient {
  getAvailability(args: {
    from: string;
    to: string;
  }): Promise<{ id: string; startsAt: string; endsAt: string }[]>;
  bookSlot(args: {
    slotId: string;
    email: string;
    name: string;
    role: string;
    message?: string;
  }): Promise<{ bookingId: string; confirmationUrl: string }>;
}

export const stubCalComClient: CalComClient = {
  async getAvailability({ from }) {
    return [
      {
        id: `stub-${from}-1`,
        startsAt: `${from}T10:00:00.000Z`,
        endsAt: `${from}T10:30:00.000Z`,
      },
      {
        id: `stub-${from}-2`,
        startsAt: `${from}T11:00:00.000Z`,
        endsAt: `${from}T11:30:00.000Z`,
      },
    ];
  },
  async bookSlot(args) {
    return {
      bookingId: `stub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      confirmationUrl: `https://cal.com/stub/${args.slotId}`,
    };
  },
};

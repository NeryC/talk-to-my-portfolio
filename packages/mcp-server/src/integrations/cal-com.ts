export interface CalComClient {
  bookSlot(args: {
    slotId: string;
    email: string;
    name: string;
    role: string;
    message?: string;
  }): Promise<{ bookingId: string; confirmationUrl: string }>;
}

export const stubCalComClient: CalComClient = {
  async bookSlot(args) {
    return {
      bookingId: `stub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      confirmationUrl: `https://cal.com/stub/${args.slotId}`,
    };
  },
};

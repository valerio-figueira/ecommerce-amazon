import type { EmailSender } from '@ecommerce-amazon/domain';
import type { Logger } from '@ecommerce-amazon/shared';

export class ConsoleEmailSender implements EmailSender {
  constructor(private readonly logger: Logger) {}

  async send(params: { to: string; subject: string; html: string }): Promise<void> {
    this.logger.info('Email sent (console)', {
      to: params.to,
      subject: params.subject,
    });
  }
}

export class ResendEmailSender implements EmailSender {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly fallback: EmailSender,
  ) {}

  async send(params: { to: string; subject: string; html: string }): Promise<void> {
    if (!this.apiKey) {
      return this.fallback.send(params);
    }
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }
  }
}

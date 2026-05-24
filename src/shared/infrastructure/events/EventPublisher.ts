type EventHandler = (event: any) => Promise<void>;

export class EventPublisher {
    private handlers: Map<string, EventHandler[]> = new Map();

    /**
     * Suscribe un handler a un evento
     */
    subscribe(eventName: string, handler: EventHandler): void {
        if (!this.handlers.has(eventName)) {
            this.handlers.set(eventName, []);
        }
        this.handlers.get(eventName)!.push(handler);
        console.log(`[EventPublisher] Handler subscribed to event: ${eventName}`);
    }

    /**
     * Publica un evento a todos los handlers suscritos
     */
    async publish(eventName: string, event: any): Promise<void> {
        const handlers = this.handlers.get(eventName) || [];

        if (handlers.length === 0) {
            console.log(`[EventPublisher] No handlers for event: ${eventName}`);
            return;
        }

        console.log(`[EventPublisher] Publishing event: ${eventName}`, event);

        for (const handler of handlers) {
            try {
                await handler(event);
            } catch (error) {
                console.error(`[EventPublisher] Error in handler for ${eventName}:`, error);
            }
        }
    }
}

// Singleton instance
export const eventPublisher = new EventPublisher();

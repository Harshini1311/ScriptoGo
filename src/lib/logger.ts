type LogLevel = "info" | "warn" | "error";

class Logger {
    private isServer = typeof window === "undefined";

    private formatMessage(level: LogLevel, message: string, data?: any) {
        const timestamp = new Date().toISOString();
        const context = this.isServer ? "[SERVER]" : "[CLIENT]";
        return `${timestamp} ${context} [${level.toUpperCase()}]: ${message}`;
    }

    info(message: string, data?: any) {
        console.log(this.formatMessage("info", message), data || "");
    }

    warn(message: string, data?: any) {
        console.warn(this.formatMessage("warn", message), data || "");
    }

    error(message: string, data?: any) {
        console.error(this.formatMessage("error", message), data || "");
        // Future: Integrate with external services like Sentry here
    }
}

export const logger = new Logger();

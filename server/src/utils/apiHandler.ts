import { transformDates } from "./dateTransformer";

class APIResponse<T = any> {
    constructor(
        public status: number,
        public message: string = "success",
        public data: T,
        public success: boolean
    ) {
        this.success = status >= 200 && status < 300;
    }

    toJSON() {
        return transformDates({
            status: this.status,
            message: this.message,
            data: this.sanitizeBigInt(this.data),
            success: this.success,
        });
    }

    private sanitizeBigInt(data: any): any {
        if (data === null || data === undefined) return data;
        if (typeof data === "bigint") {
            return data.toString();
        }
        if (Array.isArray(data)) {
            return data.map(this.sanitizeBigInt.bind(this));
        }
        if (typeof data === "object") {
            return Object.entries(data).reduce((acc, [key, value]) => {
                acc[key] = this.sanitizeBigInt(value);
                return acc;
            }, {} as Record<string, any>);
        }
        return data;
    }
}

class APIError extends Error {
    constructor(
        public status: number,
        public message: string,
        public errors: any,
        public success: boolean = false // Default to false
    ) {
        super(message);
    }

    toJSON() {
        return {
            status: this.status,
            message: this.message,
            errors: this.errors,
            success: this.success,
        };
    }
}


export { APIError, APIResponse };
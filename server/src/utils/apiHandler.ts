class APIError extends Error {
    constructor(public status: number, public message: string, public errors: any, public success: boolean) {
        super(message);
        this.status = status;
        this.message = message;
        this.errors = errors;
        this.success = false;
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

class APIResponse {
    constructor(
        public status: number,
        public message: string = "success",
        public data: any,
        public success: boolean
    ) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.success = status >= 200 && status < 300;
    }

    toJSON() {
        return {
            status: this.status,
            message: this.message,
            data: this.sanitizeBigInt(this.data),
            success: this.success,
        };
    }

    private sanitizeBigInt(data: any): any {
        if (data === null || data === undefined) return data;
        if (typeof data === "bigint") {
            return data.toString(); // Convert BigInt to string
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


export {
    APIError,
    APIResponse
}
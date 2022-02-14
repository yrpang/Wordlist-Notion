class APIError {
    constructor(type, msg) {
        this.type = type;
        this.msg = msg;
        this.valueOf = function () {
            return this.type;
        };
        this.toString = function () {
            return `${this.type} Error: ${this.msg}.`;
        }
    }
}

export { APIError }
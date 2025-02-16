const getDebouncedFunction = <T extends unknown[]>(
    func: (...args: T) => void,
    delay: number
): (...args: T) => void => {
    let timeoutId: NodeJS.Timeout;
    return function (this: unknown, ...args: T): void {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};


export default getDebouncedFunction;
export interface StaticValue {
    _$litStatic$: string;
    r: symbol;
}

export const literal = (str: string): StaticValue => {
    return {
        _$litStatic$: str,
        r: Symbol.for('')
    } as StaticValue
}

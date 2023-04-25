export interface StaticValue {
    _$litStatic$: string;
    r: symbol;
}

export const literal = (str: string): StaticValue => {
    return {
        _$litStatic$: '',
        r: Symbol.for('')
    } as StaticValue
}

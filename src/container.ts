export type Type = { new (...args: any[]): any };

/** @internal */
export class Container {
    private instances: Map<string, any> = new Map<string, any>();
    private types: Map<string, Type> = new Map<string, Type>();

    public add(type: Type, name?: string): void {
        if (!name && !type.prototype.__ioc__injectable) {
            throw new Error(`Type ${type.name} is not injectable`);
        }

        this.types.set(name ?? type.prototype.__ioc__injectable, type);
    }

    public get<T>(name: string): T {
        if (!this.instances.has(name)) {
            const type = this.types.get(name);
            if (!type) throw new Error(`${name} is not a valid type`);

            // constructor params
            const instance = new type(
                ...(type.prototype.__ioc__inject_constructor ?? []).map((inject: string) => this.get(inject)),
            );

            // class props
            (type.prototype.__ioc__inject_prop ?? []).forEach(
                ([prop, dependency]: [string, string]) => (instance[prop] = this.get(dependency)),
            );

            this.instances.set(name, instance);
        }

        return this.instances.get(name);
    }
}

export function injectable(name: string) {
    return function (target: Type) {
        if (!target.prototype.__ioc__injectable) target.prototype.__ioc__injectable = name;
    };
}

export function inject(name: string) {
    return function (target: any, propertyKey: string | symbol, parameterIndex?: number) {
        if (parameterIndex !== undefined) {
            // constructor param
            if (!target.prototype.__ioc__inject_constructor) target.prototype.__ioc__inject_constructor = [];
            target.prototype.__ioc__inject_constructor[parameterIndex] = name;
        } else if (propertyKey !== undefined) {
            // class property
            if (!target.constructor.prototype.__ioc__inject_prop) target.constructor.prototype.__ioc__inject_prop = [];
            target.constructor.prototype.__ioc__inject_prop.push([propertyKey, name]);
        }
    };
}

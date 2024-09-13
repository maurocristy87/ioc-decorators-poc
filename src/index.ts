import { Container, inject, injectable } from "./container";

const types = {
    SystemA: Symbol.for("SystemA"),
    SystemB: Symbol.for("SystemB"),
    SystemC: Symbol.for("SystemC"),
    SystemD: Symbol.for("SystemD"),
};

interface System {
    getNames(): string;
}

@injectable(types.SystemA)
class SystemA implements System {
    private name: string = "SystemA";

    public getNames(): string {
        return this.name;
    }
}

@injectable(types.SystemB)
class SystemB implements System {
    private systemA: SystemA;
    private name: string = "SystemB";

    constructor(@inject(types.SystemA) systemA: SystemA) {
        this.systemA = systemA;
    }

    public getNames(): string {
        return this.systemA.getNames() + this.name;
    }
}

class SystemC implements System {
    private name: string = "SystemC";

    public getNames(): string {
        return this.name;
    }
}

@injectable(types.SystemD)
class SystemD implements System {
    @inject(types.SystemB) private systemB: SystemB;
    private systemC: SystemC;
    private name: string = "SystemD";

    constructor(@inject(types.SystemC) systemC: SystemC) {
        this.systemC = systemC;
    }

    public getNames(): string {
        return this.systemB.getNames() + this.systemC.getNames() + this.name;
    }
}

const container = new Container();

container.add(SystemA);
container.add(SystemB);
container.add(SystemC, types.SystemC);
container.add(SystemD);

console.log(container.get<System>(types.SystemB).getNames());
console.log(container.get<System>(types.SystemD).getNames());

import { Container, inject, injectable } from "./container";

interface System {
    getNames(): string;
}

@injectable("SystemA")
class SystemA implements System {
    private name: string = "SystemA";

    public getNames(): string {
        return this.name;
    }
}

@injectable("SystemB")
class SystemB implements System {
    private systemA: SystemA;
    private name: string = "SystemB";

    constructor(@inject("SystemA") systemA: SystemA) {
        this.systemA = systemA;
    }

    public getNames(): string {
        return this.systemA.getNames() + this.name;
    }
}

@injectable("SystemC")
class SystemC implements System {
    private name: string = "SystemC";

    public getNames(): string {
        return this.name;
    }
}

@injectable("SystemD")
class SystemD implements System {
    @inject("SystemB") private systemB: SystemB;
    private systemC: SystemC;
    private name: string = "SystemD";

    constructor(@inject("SystemC") systemC: SystemC) {
        this.systemC = systemC;
    }

    public getNames(): string {
        return this.systemB.getNames() + this.systemC.getNames() + this.name;
    }
}

const container = new Container();

container.add(SystemA);
container.add(SystemB);
container.add(SystemC);
container.add(SystemD);

console.log(container.get<System>("SystemB").getNames());
console.log(container.get<System>("SystemD").getNames());

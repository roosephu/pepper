import { Model, Ref } from "@/pepper/db";

export default class PepperCreator {
    public firstName: string;
    public lastName: string;
    public creatorType: string;
    public _id: string;
    public $ref: Ref<PepperCreator>;

    constructor(firstName: string, lastName: string, creatorType?: string) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.creatorType = creatorType;
    }

    public _(): string {
        return `${this.lastName}, ${this.firstName}`;
    }
}

export const modelCreator = new Model<PepperCreator>("creator", PepperCreator);

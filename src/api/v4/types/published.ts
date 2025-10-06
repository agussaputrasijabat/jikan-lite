import {Prop} from "./prop";

export interface Published {
    from: Date;
    to: Date;
    prop: Prop;
    string: string;
}
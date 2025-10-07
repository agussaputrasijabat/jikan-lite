import {QueryOptions} from "../database/types/repository";

export interface ItemService<T> {
    findById(id: number): Promise<T | null>;
    findAll(): Promise<T[]>;
    findByQuery(options: QueryOptions): Promise<T[]>;
    create(item: T): Promise<T>;
    update(id: number, item: Partial<T>): Promise<T | null>;
    delete(id: number): Promise<boolean>;
}
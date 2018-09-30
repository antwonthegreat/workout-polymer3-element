export declare type IdMap<T> = {
    [key: number]: T;
};
export const toDictionary = (items:Array<{Id:number}>) : IdMap<any> => {
    return items.reduce((acc, item) => {return{...acc, [item.Id]:item}},{})
}
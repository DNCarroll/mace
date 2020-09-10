type AllElements = {
    'a': HTMLAnchorElement,
    'div': HTMLDivElement,
    'span': HTMLSpanElement,
    'table': HTMLTableElement,
    'tr': HTMLTableRowElement,
    'td': HTMLTableCellElement,
    'input': HTMLInputElement,
    'textarea': HTMLTextAreaElement,
    'select': HTMLSelectElement,
    'button': HTMLButtonElement,
    'label': HTMLLabelElement,
    'th': HTMLTableHeaderCellElement,
    'tfoot': HTMLTableSectionElement,
    'tbody': HTMLTableSectionElement,
    'thead': HTMLTableSectionElement,
    'any': HTMLElement,
    'form': HTMLFormElement,
    'i': HTMLElement,
    'fieldset': HTMLFieldSetElement,
    'ul': HTMLUListElement,
    "li": HTMLLIElement
};
type Caster<T extends string> = T extends keyof AllElements ? AllElements[T] : HTMLElement;
module tag {
    export const any = 'any';
    export const div = 'div';
    export const input = 'input';
    export const textarea = 'textarea';
    export const select = 'select';
    export const button = 'button';
    export const a = 'a';
    export const span = 'span';
    export const label = 'label';
    export const table = 'table';
    export const tr = 'tr';
    export const td = 'td';
    export const th = 'th';
    export const thead = 'thead';
    export const tfoot = 'tfoot';
    export const tbody = 'tbody';
    export const form = 'form';
    export const i = 'i';
    export const fieldset = 'fieldset';
    export const ul = 'ul';
    export const li = 'li';
};
module HTMLElementHelper {
    export function IsMatch<T extends string>(ele: HTMLElement, tagName: string, predicate: (ele: Caster<T>) => boolean = null): boolean {
        predicate = predicate === null ? (e: Caster<T>) => true : predicate;
        return (tagName === tag.any || ele.tagName.toLowerCase() === tagName) && predicate(<Caster<T>>ele);
    }
}
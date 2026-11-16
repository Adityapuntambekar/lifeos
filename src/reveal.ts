import type {SearchItem,SearchPage} from './searchModel'
let pending:SearchItem|null=null
export function queueReveal(item:SearchItem){pending=item.id?item:null}
export function takeReveal(page:SearchPage){if(pending?.page!==page)return null;const item=pending;pending=null;return item}

/**
 * @description render row
 * @author wangfupeng
 */
import { IDomEditor } from '@wangeditor-next/core';
import { Element as SlateElement } from 'slate';
import { VNode } from 'snabbdom';
declare function renderTableRow(_elemNode: SlateElement, children: VNode[] | null, _editor: IDomEditor): VNode;
export default renderTableRow;

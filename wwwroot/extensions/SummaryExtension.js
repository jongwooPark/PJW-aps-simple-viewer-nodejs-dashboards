/// import * as Autodesk from "@types/forge-viewer";

import { BaseExtension } from './BaseExtension.js';
import { SummaryPanel } from './SummaryPanel.js';

// For now, the names of properties we want to compute the aggregates for are hard-coded.
// In future these could be retrieved via the extension `options`, or perhaps set in the UI.
const SUMMARY_PROPS = ['Length', 'Area', 'Volume', 'Density', 'Mass', 'Price'];

class SummaryExtension extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this._button = null;
        this._panel = null;
    }

    load() {
        super.load();
        console.log('(2)SummaryExtension loaded.');
        return true;
    }

    unload() {
        super.unload();
        if (this._button) {
            this.removeToolbarButton(this._button);
            this._button = null;
        }
        if (this._panel) {
            this._panel.setVisible(false);
            this._panel.uninitialize();
            this._panel = null;
        }
        console.log('(3)SummaryExtension unloaded.');
        return true;
    }

    onToolbarCreated() {
        console.log('(2-2)onToolbarCreated');  
        this._panel = new SummaryPanel(this, 'model-summary-panel', 'Model Summary 제목');
        this._button = this.createToolbarButton('summary-button', 'https://img.icons8.com/small/32/brief.png', 'Show Model Summary 보이기');
        this._button.onClick = () => {
            console.log('(4)Click!!');
           
           //판넬객체의 on/off 스위치, 버튼의 acctive/inactive 스위치
            this._panel.setVisible(!this._panel.isVisible());
            this._button.setState(this._panel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
            //클릭을 하고 판넬이 visible하면 update 갱신
            if (this._panel.isVisible()) {
                this.update();
            }
        };
    }

    onModelLoaded(model) {
        super.onModelLoaded(model);
        this.update();
    }

    onSelectionChanged(model, dbids) {
        console.log('onSelectionChanged by summeryExtension!!');
        super.onSelectionChanged(model, dbids);
        this.update();
    }

    onIsolationChanged(model, dbids) {
        super.onIsolationChanged(model, dbids);
        this.update();
    }

    async update() {
        if (this._panel) {
            const selectedIds = this.viewer.getSelection();
            const isolatedIds = this.viewer.getIsolatedNodes();

            console.log('isolatedIds = ',isolatedIds);
            if (selectedIds.length > 0) { // If any nodes are selected, compute the aggregates for them
               //선택한 오브젝트
               // console.log('kkk =  SummaryExtension selectedIds', selectedIds);
                this._panel.update(this.viewer.model, selectedIds, SUMMARY_PROPS);
            } else if (isolatedIds.length > 0) { // Or, if any nodes are isolated, compute the aggregates for those
                this._panel.update(this.viewer.model, isolatedIds, SUMMARY_PROPS);
            } else { // Otherwise compute the aggregates for all nodes
               //아무것도 선택안될시 전부 불러옴
                
                const dbids = await this.findLeafNodes(this.viewer.model);
               // console.log('kkk =  SummaryExtension  not   selectedIds', dbids);
                this._panel.update(this.viewer.model, dbids, SUMMARY_PROPS);
            }
        }
    }
}

//console.log('(1)SummaryExtension 등록!!');
Autodesk.Viewing.theExtensionManager.registerExtension('SummaryExtension', SummaryExtension);


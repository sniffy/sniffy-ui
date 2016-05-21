/// <reference path="../../typings/index.d.ts"/>

import {SniffyWidget} from './SniffyWidget';
import {SniffySummary} from './SniffySummary';

class Sniffy {

    private widget: SniffyWidget;
    private summary: SniffySummary;

    constructor() {
      this.widget = new SniffyWidget();
      this.summary = new SniffySummary();
      //_.map()
      //let x : LoDashStatic = {};
    }
}

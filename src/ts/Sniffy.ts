import {SniffyWidget} from './SniffyWidget';
import {SniffySummary} from './SniffySummary';


class Sniffy {

    private widget: SniffyWidget;
    private summary: SniffySummary;
    private MINI: IMinifiedJS = <IMinifiedJS>require('minified');

    constructor() {
        this.widget = new SniffyWidget();
        this.summary = new SniffySummary();
        this.MINI.$();
        //_.map()
        //let x : LoDashStatic = {};
    }
}

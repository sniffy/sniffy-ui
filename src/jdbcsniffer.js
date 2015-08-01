;(function(){

    //@@include('../bower_components/minified/dist/minified-web.js')
    var MINI = require('minified');
    var $ = MINI.$, EE = MINI.EE;

    $(function(){

        var snifferElement = $('#jdbc-sniffer');
        var sqlQueries = snifferElement.get('%sql-queries');
        //var requestId = snifferElement.get('%request-id');

        var queryCounterDiv = EE('div', {
            'className' : 'jdbc-sniffer-query-count'
        }, sqlQueries);

        $('body').add(queryCounterDiv);

    });

}());
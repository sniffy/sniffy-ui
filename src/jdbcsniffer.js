;(function(){

    //@@include('../bower_components/minified/dist/minified.js')
    var MINI = require('minified');
    var $ = MINI.$, EE = MINI.EE, HTML = MINI.HTML;

    $(function(){

        var snifferElement = $('#jdbc-sniffer');
        var sqlQueries = snifferElement.get('%sql-queries');
        //var requestId = snifferElement.get('%request-id');

        var queryList = HTML(
            '//@@include("../dist/jdbcsniffer.html")'
        );

        $('body').add(queryList);

        var queryCounterDiv = EE('div', { 'className' : 'jdbc-sniffer-query-count' }, sqlQueries);
        queryCounterDiv.on('click', function(){
            $('.jdbc-sniffer-ui').set('$display', 'block');
        });
        $('body').add(queryCounterDiv);

    });

}());
;(function(){

    //@@include('../bower_components/minified/dist/minified.js')
    var MINI = require('minified');
    var $ = MINI.$, EE = MINI.EE, HTML = MINI.HTML;

    $(function(){

        var snifferScriptElement = $('#jdbc-sniffer-script');
        var snifferScriptSrc = snifferScriptElement.get('@src');

        var baseUrl = snifferScriptSrc.substring(0, snifferScriptSrc.lastIndexOf('/') + 1);

        // inject stylesheet
        var snifferStyleHref = baseUrl + '/jdbcsniffer.css';
        $('head').add(EE('link', {
            '@rel' : 'stylesheet',
            '@type' : 'text.css',
            '@href' : snifferStyleHref,
            '@media' : 'all'
        }));

        // load data attributes
        // todo: move the data attributes to the script tag
        var snifferElement = $('#jdbc-sniffer');
        var sqlQueries = snifferElement.get('%sql-queries');
        var requestId = snifferElement.get('%request-id');

        // create main GUI
        var queryList = HTML(
            '//@@include("../dist/jdbcsniffer.html")'
        );

        $('body').add(queryList);
        var toggle = queryList.toggle({'$display': 'none'}, {'$display': 'block'});
        $('button.close', queryList).on('click', toggle);

        // append toolbar
        var queryCounterDiv = EE('div', { 'className' : 'jdbc-sniffer-query-count' }, sqlQueries);
        queryCounterDiv.on('click', toggle);
        $('body').add(queryCounterDiv);

        // request data
        $.request('get', baseUrl + 'request/' + requestId)
            .then(function (data) {
                console.log(data);
            })
            .error(function (status, statusText, responseText) {
                console.log(status + ' ' + statusText + ' ' + responseText);
            });

    });

}());
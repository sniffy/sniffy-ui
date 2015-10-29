;(function(){

    /*jshint unused:false*/

    var defs = {};

    function require(name) {
        return defs[name];
    }

    function define(name, f) {
        defs[name] = defs[name] || f(require);
    }

    //@@include('../bower_components/minified/dist/minified.js')

    var MINI = require('minified');
    var $ = MINI.$, EE = MINI.EE, HTML = MINI.HTML;

    window.jdbcSniffer = {numberOfSqlQueries : 0};

    var ajaxRequests = [];
    var loadQueries = function(url, requestId) {
        ajaxRequests.push({"url":url,"requestId":requestId});
    };

    var incrementQueryCounter = function(numQueries) {
        window.jdbcSniffer.numberOfSqlQueries += numQueries;
    };

    $(function(){

        var snifferHeaderElement = $('#jdbc-sniffer-header');
        var requestId = snifferHeaderElement.get('%request-id');
        var snifferScriptSrc = snifferHeaderElement.get('@src');
        var baseUrl = snifferScriptSrc.substring(0, snifferScriptSrc.lastIndexOf('/') + 1);

        var snifferElement = $('#jdbc-sniffer');
        var sqlQueries = snifferElement.get('%sql-queries');

        // inject stylesheet
        var snifferStyleHref = baseUrl + 'jdbcsniffer.css';
        $('head').add(EE('link', {
            '@rel' : 'stylesheet',
            '@type' : 'text/css',
            '@href' : snifferStyleHref,
            '@media' : 'all'
        }));

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

        incrementQueryCounter = function(numQueries) {
            // increment global counter
            window.jdbcSniffer.numberOfSqlQueries += numQueries;
            $('.jdbc-sniffer-query-count').fill(window.jdbcSniffer.numberOfSqlQueries);
        };
        
        incrementQueryCounter(parseInt(sqlQueries));

        // request data
        loadQueries(location.pathname, baseUrl + 'request/' + requestId);

        loadQueries = function(url, requestDetailsUrl) {
            $.request('get', requestDetailsUrl)
                .then(function (data, xhr) {
                    var statementsTableBody = $('#jdbc-sniffer-queries');
                    statementsTableBody.add(EE('tr',[
                        EE('td', {'className' : 'col-md-12 success', '@colspan' : '2'}, url)
                    ]));
                    var noQueriesRow = EE('tr',[
                        EE('td','No queries'),
                        EE('td','')
                    ]);
                    if (xhr.status === 200) {
                        var statements = $.parseJSON(data);
                        if (statements.length === 0) {
                            statementsTableBody.add(noQueriesRow);
                        } else {
                            for (var i = 0; i < statements.length; i++) {
                                var statement = statements[i];
                                statementsTableBody.add(EE('tr',[
                                    EE('td',statement.query),
                                    EE('td',statement.time)
                                ]));
                            }
                        }
                    } else if (xhr.status === 204) {
                        statementsTableBody.add(noQueriesRow);
                    }
                })
                .error(function (status, statusText, responseText) {
                    console.log(status + ' ' + statusText + ' ' + responseText);
                });
        };

        for (var i = 0; i < ajaxRequests.length; i++) {
            var ajaxRequest = ajaxRequests[i];
            loadQueries(ajaxRequest.url, ajaxRequest.requestId);
        }

    });

    // Intercept ajax queries
    (function(XHR) {
        
        var open = XHR.prototype.open;
        var send = XHR.prototype.send;
        
        XHR.prototype.open = function(method, url, async, user, pass) {
            this._url = url;
            this._method = method;
            open.call(this, method, url, async, user, pass);
        };
        
        XHR.prototype.send = function(data) {
            var self = this;
            var start;
            var oldOnReadyStateChange;
            var url = this._url;
            var method = this._method;
            
            function onReadyStateChange() {
                if(self.readyState === 4 /* complete */) {
                    var sqlQueries = self.getResponseHeader("X-Sql-Queries");
                    if (sqlQueries && parseInt(sqlQueries) > 0) {
                        incrementQueryCounter(parseInt(sqlQueries));

                        var xRequestDetailsHeader = self.getResponseHeader("X-Request-Details"); // details url relative to ajax original request

                        var ajaxUrl = document.createElement('a');
                        ajaxUrl.href = url;

                        var requestDetailsUrl = ajaxUrl.protocol + '//' + ajaxUrl.host + xRequestDetailsHeader;
                        var ajaxUrlLabel = (location.protocol === ajaxUrl.protocol && location.host === ajaxUrl.host) ?
                            ajaxUrl.pathname + ajaxUrl.search + ajaxUrl.hash : ajaxUrl.href;

                        loadQueries(method + ' ' + ajaxUrlLabel, requestDetailsUrl);
                    }
                }
                
                if(oldOnReadyStateChange) {
                    oldOnReadyStateChange();
                }
            }
            
            if(!this.noIntercept) {
                start = new Date();
                
                if(this.addEventListener) {
                    this.addEventListener("readystatechange", onReadyStateChange, false);
                } else {
                    oldOnReadyStateChange = this.onreadystatechange; 
                    this.onreadystatechange = onReadyStateChange;
                }
            }
            
            send.call(this, data);
        };
    })(XMLHttpRequest);

}.apply({}));
;(function(){

    /*jshint unused:false*/

    // require/define basic support

    var defs = {};

    function require(name) {
        return defs[name];
    }

    function define(name, f) {
        defs[name] = defs[name] || f(require);
    }

    // include libraries: minified.js

    //@@include('../bower_components/minified/dist/minified.js')

    var MINI = require('minified');
    var $ = MINI.$, EE = MINI.EE, HTML = MINI.HTML;

    // register sniffy in global scope

    window.sniffy = {
        numberOfSqlQueries : 0,
        statementsCounter : 0
    };

    var ajaxRequests = [];
    var loadQueries = function(url, requestId) {
        ajaxRequests.push({"url":url,"requestId":requestId});
    };

    var incrementQueryCounter = function(numQueries) {
        // increment global counter
        window.sniffy.numberOfSqlQueries += numQueries;
    };

    // setup sniffer UI on dom ready

    $(function(){

        var fixZIndex = function() {
            $('body *').filter(function(el, index){ 
                return $(el).get('$zIndex') === '2147483647' && $(el).get('$') !== 'sniffy-query-count' && $(el).get('$') !== 'sniffy-iframe'; 
            }).set('$zIndex','2147483646');
        };
        fixZIndex();
        window.setTimeout(fixZIndex, 10);
        window.setTimeout(fixZIndex, 100);
        window.setTimeout(fixZIndex, 200);
        window.setTimeout(fixZIndex, 500);
        window.setTimeout(fixZIndex, 1000);
        window.setTimeout(fixZIndex, 2000);

        var snifferHeaderElement = $('#sniffy-header');
        var requestId = snifferHeaderElement.get('%request-id');
        var snifferScriptSrc = snifferHeaderElement.get('@src');
        var baseUrl = snifferScriptSrc.substring(0, snifferScriptSrc.lastIndexOf('/') + 1);

        var snifferElement = $('#sniffy');
        var sqlQueries = snifferElement.get('%sql-queries');

        // inject stylesheet
        $('head').add(EE('style', '//@@include("../build/sniffy.css")'));

        // create main GUI

        var iframe = EE('iframe', {'$display' : 'none', 'className' : 'sniffy-iframe', '@scrolling' : 'no'});
        $('body').add(iframe);
        var toggleIframe = iframe.toggle({'$display': 'none'}, {'$display': 'block'});
        var toggleMaximizedIframe = iframe.toggle('maximized');
        
        // append toolbar
        var queryCounterDiv = EE('div', { 'className' : 'sniffy-query-count' }, sqlQueries);
        var toggleIcon = queryCounterDiv.toggle({'$display': 'block'}, {'$display': 'none'}); 
        queryCounterDiv.on('click', function() {
            toggleIframe();
            toggleMaximizedIframe(false);
            toggleMaximizeIcon(false);
        });
        $('body').add(queryCounterDiv);

        // create iframe GUI

        var iframeHtml = '//@@include("../build/sniffy.iframe.html")';
        var iframeDocument = iframe.get('contentWindow').document;
        iframeDocument.open();
        iframeDocument.write(iframeHtml);
        iframeDocument.close();

        var statementsTableBody = $(iframeDocument.getElementById('sniffy-queries'));
        $(iframeDocument.getElementById('sniffy-iframe-close')).on('click', function() {
            toggleIframe();
            toggleIcon(false);
        });

        // todo persist maximized state; use some storage to keep the state between browser launches
        var toggleMaximizeIcon = $('span', $(iframeDocument.getElementById('sniffy-iframe-maximize'))).toggle(
            {'$':'+glyphicon-resize-full -glyphicon-resize-small'},
            {'$':'+glyphicon-resize-small -glyphicon-resize-full'}
        );
        var maximizeIframe = function() {
            toggleIcon();
            toggleMaximizedIframe();
            toggleMaximizeIcon();
        };

        $(iframeDocument.getElementById('sniffy-iframe-maximize')).on('click', maximizeIframe);

        incrementQueryCounter = function(numQueries) {
            // increment global counter
            window.sniffy.numberOfSqlQueries += numQueries;
            $('.sniffy-query-count').fill(window.sniffy.numberOfSqlQueries);
        };
        
        incrementQueryCounter(parseInt(sqlQueries));

        // request data
        loadQueries(location.pathname, baseUrl + 'request/' + requestId);

        loadQueries = function(url, requestDetailsUrl) {
            $.request('get', requestDetailsUrl)
                .then(function (data, xhr) {
                    var noQueriesRow = EE('tr',[
                        EE('td','No queries'),
                        EE('td','')
                    ]);
                    iframe.get('contentWindow').hljs.configure({useBR: true});
                    var stats = $.parseJSON(data);
                    var statements = stats.executedQueries;
                    statementsTableBody.add(EE('tr',[
                            EE('th', {}, url),
                            EE('th', {}, stats.time)
                        ]));
                    if (xhr.status === 200) {
                        if (statements.length === 0) {
                            statementsTableBody.add(noQueriesRow);
                        } else {
                            var showStackClickHandler = function(num) {
                                return function () {
                                    var showStackEl = $(iframeDocument.getElementById('show-stack-' + num));
                                    var stackTraceEl = $(iframeDocument.getElementById('stackTrace-' + num));
                                    if (showStackEl.is('.show-stack')) {
                                        // show stack and toggle state
                                        showStackEl.set('$', '-show-stack');
                                        showStackEl.fill('Hide stack trace');
                                        stackTraceEl.show();
                                    } else {
                                        showStackEl.set('$', '+show-stack');
                                        showStackEl.fill('Show stack trace');
                                        stackTraceEl.hide();
                                    }
                                };
                            };
                            for (var i = 0; i < statements.length; i++) {
                                var statement = statements[i];
                                var codeEl, stackEl, statementId = ++window.sniffy.statementsCounter;
                                // sql + elapsed time
                                statementsTableBody.add(EE('tr',[
                                    EE('td',[EE('div',[codeEl = EE('code',{'@class':'language-sql'},statement.query)])]),
                                    EE('td',statement.time)
                                ]));
                                iframe.get('contentWindow').hljs.highlightBlock(codeEl[0]);
                                // stack trace
                                if (!statement.stackTrace || statement.stackTrace.length === 0) {
                                    statement.stackTrace = 'No stack trace available';
                                }
                                statementsTableBody.add(EE('tr',[ 
                                    EE('td',{'@colspan': 2 }, [
                                        EE('div',[
                                            EE('button', {'@class': 'btn btn-link btn-xs show-stack', '@id' :'show-stack-' + statementId}, 'Show stack trace')
                                                .on('click', showStackClickHandler(statementId)),
                                            stackEl = EE('code',{'@class':'java','$display' : 'none', '@id' : 'stackTrace-' + statementId},statement.stackTrace)])
                                        ])
                                    ]));
                                iframe.get('contentWindow').hljs.highlightBlock(stackEl[0]);
                            }
                        }
                    } else {
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
                        if ('' === ajaxUrl.protocol && '' === ajaxUrl.host) {
                            ajaxUrl.protocol = location.protocol;
                            ajaxUrl.host = location.host;
                        }

                        var requestDetailsUrl = ajaxUrl.protocol + '//' + ajaxUrl.host + xRequestDetailsHeader;
                        var ajaxUrlLabel = 
                            (location.protocol === ajaxUrl.protocol && location.host === ajaxUrl.host) ?
                            (ajaxUrl.pathname.slice(0,1) === '/' ? ajaxUrl.pathname : '/' + ajaxUrl.pathname) + 
                            ajaxUrl.search + ajaxUrl.hash : ajaxUrl.href;

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
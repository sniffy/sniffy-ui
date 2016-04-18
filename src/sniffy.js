var io = io || {};
io.sniffy = io.sniffy || (function(){

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
        statementsCounter : 0,
        serverTime : 0
    };

    var ajaxRequests = [];
    var loadQueries = function(url, requestId, timeToFirstByte, doNotUpdateTimeCounter) {
        ajaxRequests.push({"url":url,"requestId":requestId,"timeToFirstByte":timeToFirstByte,"doNotUpdateTimeCounter":doNotUpdateTimeCounter});
    };

    var incrementQueryCounter = function(numQueries) {
        // increment global counter
        window.sniffy.numberOfSqlQueries += numQueries;
    };

    var incrementServerTime = function(serverTime) {
        // increment global counter
        window.sniffy.serverTime += serverTime;
    };

    // setup sniffer UI on dom ready

    $(function(){

        var fixZIndex = function() {
            $('body *').filter(function(el, index){
                return $(el).get('$zIndex') === '2147483647' && $(el).get('@id') !== 'sniffy-widget' && $(el).get('@id') !== 'sniffy-iframe';
            }).set('$zIndex','2147483646');
            // TODO: fix it 
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
        var serverTime = snifferElement.get('%server-time');

        // inject stylesheet
        $('head').add(EE('style', '//@@include("../build/sniffy.css")'));

        // create main GUI

        var iframe = EE('iframe', {'$display' : 'none', '@id' : 'sniffy-iframe', 'className' : 'sniffy-iframe', '@scrolling' : 'no'});
        $('body').add(iframe);
        var toggleIframe = iframe.toggle({'$display': 'none'}, {'$display': 'block'});
        var toggleMaximizedIframe = iframe.toggle('maximized');

        // append sniffy widget
        var queryWidget = EE('div', {'@id' : 'sniffy-widget'}, [
            EE('div', {'$backgroundColor' : '#7A8288', '$color' : '#FFF'}, 'Sniffy'),
            EE('div', {'className' : 'sniffy-server-time-outer sniffy-widget-icon'}, [
                EE('div', {'className' : 'sniffy-server-time-image sniffy-widget-icon-image'}, ''),
                EE('div', {'className' : 'sniffy-server-time sniffy-widget-icon-label'}, serverTime)
            ]),
            EE('div', {'className' : 'sniffy-query-count-outer sniffy-widget-icon'}, [
                EE('div', {'className' : 'sniffy-query-count-image sniffy-widget-icon-image'}, ''),
                EE('div', {'className' : 'sniffy-query-count sniffy-widget-icon-label'}, sqlQueries)
            ])
        ]);

        var toggleIcon = queryWidget.toggle({'$display': 'block'}, {'$display': 'none'});
        queryWidget.on('click', function() {
            toggleIframe();
            toggleMaximizedIframe(false);
            toggleMaximizeIcon(false);
        });
        $('body').add(queryWidget);

        // create iframe sniffy UI
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
            $('.sniffy-query-count-outer').set('+sniffy-widget-icon-active');
            setTimeout(function() {$('.sniffy-query-count-outer').set('-sniffy-widget-icon-active');}, 400);
        };

        incrementServerTime = function(serverTime) {
            // increment global counter
            serverTime = window.sniffy.serverTime += serverTime;

            var formattedTime = serverTime < 1000 ? serverTime + 'ms' :
                serverTime > 60000 ? Math.floor(serverTime / 60000) + 'm ' + Math.floor((serverTime % 60000) / 1000) + 's' :
                serverTime / 1000 + 's';

            $('.sniffy-server-time').fill(formattedTime);
            $('.sniffy-server-time-outer').set('+sniffy-widget-icon-active');
            setTimeout(function() {$('.sniffy-server-time-outer').set('-sniffy-widget-icon-active');}, 400);
        };

        var showStackClickHandler = function(num, linesCount) {
            return function () {
                var showStackEl = $(iframeDocument.getElementById('show-stack-' + num)),
                    stackTraceEl = $(iframeDocument.getElementById('stack-trace-' + num)),
                    showAllStackEl = $(iframeDocument.getElementById('show-all-stack-' + num));
                if (showStackEl.is('.show-stack')) {
                    // show stack and toggle state
                    showStackEl.set('$', '-show-stack');
                    showStackEl.fill('Hide stack trace');
                    if (linesCount >= 10) {
                        stackTraceEl.set('$height', '190px');
                        showAllStackEl.show();
                    }
                    stackTraceEl.show();
                } else {
                    showStackEl.set('$', '+show-stack');
                    showStackEl.fill('Stack trace');
                    stackTraceEl.hide();
                    showAllStackEl.hide();
                }
                iframe.get('contentWindow').nanoScroller();
            };
        };

        var showAllStackHandler = function(num) {
            return function() {
                var stackTraceEl = $(iframeDocument.getElementById('stack-trace-' + num));
                var showAllStackEl = $(iframeDocument.getElementById('show-all-stack-' + num));
                stackTraceEl.set('$height', 'auto');
                showAllStackEl.hide();
                iframe.get('contentWindow').nanoScroller();
            };
        };

        incrementQueryCounter(parseInt(sqlQueries));
        incrementServerTime(parseInt(serverTime));

        // request data
        loadQueries(location.pathname, baseUrl + 'request/' + requestId, parseInt(serverTime), true);

        loadQueries = function(url, requestDetailsUrl, timeToFirstByte, doNotUpdateTimeCounter) {
            $.request('get', requestDetailsUrl)
                .then(function (data, xhr) {
                    var noQueriesRow = EE('tr',[
                        EE('td','No queries'),
                        EE('td','')
                    ]);
                    if (xhr.status === 200 && data !== '') {
                        iframe.get('contentWindow').hljs.configure({useBR: true});
                        var stats = $.parseJSON(data);
                        if (!doNotUpdateTimeCounter) {
                            incrementServerTime(stats.time - stats.timeToFirstByte);
                        }
                        var statements = stats.executedQueries;
                        statementsTableBody.add(EE('tr',[
                            EE('th', {}, url),
                            EE('th', {}, stats.time)
                        ]));
                        if (statements.length === 0) {
                            statementsTableBody.add(noQueriesRow);
                        } else {
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
                                if (statement.stackTrace && statement.stackTrace.length > 0) {
                                    statement.stackTrace = statement.stackTrace.replace(/\r\n|\n/g, '\r\n');
                                    var linesCount = statement.stackTrace.split('\r\n').length;
                                    statementsTableBody.add(EE('tr',[
                                        EE('td',{'@colspan': 2 }, [
                                            EE('div',[
                                                EE('button', {'@class': 'btn btn-link btn-xs show-stack', '@id' :'show-stack-' + statementId}, 'Stack trace')
                                                    .on('click', showStackClickHandler(statementId, linesCount)),
                                                stackEl = EE('code',
                                                    {'@class':'java',
                                                        '$display' : 'none',
                                                        '$overflow' : 'hidden',
                                                        '@id' : 'stack-trace-' + statementId},
                                                    statement.stackTrace),
                                                EE('div', {'@class': 'show-all-stack', '$display' : 'none', '@id' :'show-all-stack-' + statementId},[
                                                    EE('button', {
                                                        '@class': 'btn btn-link btn-xs', '@id' :'show-all-stack-link-' + statementId
                                                    }, 'Show all').on('click', showAllStackHandler(statementId))
                                                ])
                                            ])
                                        ])
                                    ]));
                                    iframe.get('contentWindow').hljs.highlightBlock(stackEl[0]);
                                }
                            }
                        }
                    } else {
                        statementsTableBody.add(EE('tr',[
                            EE('th', {}, url),
                            EE('th', {}, timeToFirstByte)
                        ]));
                        statementsTableBody.add(noQueriesRow);
                    }
                    iframe.get('contentWindow').nanoScroller();
                })
                .error(function (status, statusText, responseText) {
                    console.log(status + ' ' + statusText + ' ' + responseText);
                });
        };

        for (var i = 0; i < ajaxRequests.length; i++) {
            var ajaxRequest = ajaxRequests[i];
            loadQueries(ajaxRequest.url, ajaxRequest.requestId, ajaxRequest.timeToFirstByte, ajaxRequest.doNotUpdateTimeCounter);
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
                    try {

                        var hasSniffyHeader = true;

                        if (self.getAllResponseHeaders) {
                            var headers = self.getAllResponseHeaders();
                            if (headers) {
                                hasSniffyHeader = headers.indexOf('X-Sql-Queries') !== -1;
                            } else {
                                hasSniffyHeader = false;
                            }
                        }

                        if (hasSniffyHeader) {
                            var sqlQueries = self.getResponseHeader("X-Sql-Queries");
                            var timeToFirstByte = self.getResponseHeader("X-Time-To-First-Byte");
                            if ((sqlQueries && parseInt(sqlQueries) > 0) ||
                                (timeToFirstByte && parseInt(timeToFirstByte))) {

                                incrementQueryCounter(parseInt(sqlQueries));
                                incrementServerTime(parseInt(timeToFirstByte));

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

                                loadQueries(method + ' ' + ajaxUrlLabel, requestDetailsUrl, timeToFirstByte, false);
                            }
                        }
                    } catch (e) {
                        if (console && console.log) {
                            console.log(e);
                        }
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

    return {};

}.apply({}));
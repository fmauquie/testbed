"use strict";

angular.module('app')
    .config([
        '$routeProvider',
        function ($routeProvider) {
            $routeProvider.when('/', {
                templateUrl: 'features/home/home.html'
            });
        }
    ])
    .factory('diff', [
        '$sce',
        function ($sce) {
            return function (expected, actual) {
                var rendered = '';
                var diff = JsDiff.diffChars(expected, actual);

                diff.forEach(function (part) {
                    rendered += '<span class="';
                    rendered += part.added ? 'incorrect added' :
                        part.removed ? 'incorrect removed' : 'correct';
                    rendered += '">';
                    // green for additions, red for deletions
                    // grey for common parts
                    rendered += part.value.replace(/\n/g, '<br/>') + '</span>';
                });

                return $sce.trustAsHtml(rendered);
            };
        }
    ])
    .directive('evaluator', [
        '$q',
        '$timeout',
        function ($q, $timeout) {
            return {
                scope: {
                    evaluator: '='
                },
                link: function ($scope, $element) {
                    if (!$element.nodeName === 'IFRAME') {
                        throw new Error('Evaluator must be on an iframe.');
                    }

                    function doEvaluate(deferred, script) {
                        if (!$element[0].contentWindow.evaluate) {
                            $timeout(function () {
                                doEvaluate(deferred, script);
                            }, 100);
                            return;
                        }

                        var result = $element[0].contentWindow.evaluate(script);
                        $element[0].contentWindow.location.reload();

                        if (result.error) {
                            deferred.reject(result.result);
                        }
                        else {
                            deferred.resolve(result.result);
                        }
                    }

                    $scope.evaluator = {
                        evaluate: function (script) {
                            var deferred = $q.defer();

                            doEvaluate(deferred, script);

                            return deferred.promise;
                        }
                    };
                }
            };
        }
    ])
    .controller('HomeController', [
        '$scope',
        '$window',
        'diff',
        function ($scope, $window, diff) {
            var storedTest = localStorage['test'];
            this.test = storedTest ? JSON.parse(storedTest) : {
                code: '',
                expected: ''
            };
            this.result = {
                valid: null,
                output: '',
                html: false
            };
            this.evaluator = null;
            this.evaluating = false;

            this.tryIt = function () {
                this.evaluating = true;
                localStorage.test = JSON.stringify(this.test);

                if (!this.evaluator) {
                    var deregInit = $scope.$watch(function () {
                        return this.evaluator;
                    }.bind(this), function (value) {
                        if (value) {
                            deregInit();
                            this.tryIt();
                        }
                    }.bind(this));
                    return;
                }

                this.evaluator.evaluate(this.test.code)
                    .then(function (result) {
                        this.result.output = diff(this.test.expected.trim(), result.trim());
                        this.result.valid = result.trim() === this.test.expected.trim();
                        this.result.html = true;
                        this.evaluating = false;
                        this.aceError();
                    }.bind(this))
                    .catch(function (error) {
                        this.result.valid = false;
                        console.error('Error while executing code', error);
                        this.result.output = error;
                        this.result.html = false;
                        this.evaluating = false;
                        this.aceError(error.lineNumber, error.columnNumber);
                    }.bind(this))
                ;
            };

            $scope.$watch(function () {
                return this.test;
            }.bind(this), this.tryIt.bind(this), true);

            this.aceEditor = null;
            this.aceConfig = {
                mode: 'javascript',
                onLoad: function (editor) {
                    editor.getSession().setTabSize(2);
                    editor.getSession().setUseSoftTabs(true);
                    this.aceEditor = editor;
                }.bind(this)
            };

            var lastError = null;
            this.aceError = function (line, column) {
                if (lastError !== null) {
                    this.aceEditor.getSession().removeMarker(lastError);
                }
                if (!line && !column) {
                    return;
                }

                var lineRange = this.aceEditor.getSession().getWordRange(line - 1, column - 1);
                if (column === 1) {
                    lineRange.setEnd(line - 1, Number.MAX_VALUE);
                }
                lastError = this.aceEditor.getSession().addMarker(lineRange, "error_placeholder");
            };
        }
    ])
;

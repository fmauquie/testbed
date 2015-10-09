'use strict';

/**
 * @ngdoc module
 * @name app
 * @description
 *
 * This is a very simple GTD application for AngularJS training
 */
angular.module('app', [
    'ngRoute',
    'ngResource',
    'ngMessages',
    'ui.ace'
])
    .config([
        '$routeProvider',
        function ($routeProvider) {
            $routeProvider.otherwise({
                templateUrl: '404.html'
            });
        }
    ])
;

/**
 * config.js
 *
 * @description ::  Service containing the application settings.
 *
 */

'use strict';

angular.module('semdeePortal.config', [])

    .constant('$config', {
        'api': {
            //url:'http://localhost:8080/semdee-api/',
            url:'http://195.154.82.50:8080/semdee-api/',  // stage (common-crawl)
            token: null,

            // Set the interval, in ms, the client should call the APIto check if a crawl is finished
            pollInterval: 30000,
            uri:{
                categorizer:"categorizer",
                categories:"categories",
                groups:"groups",
                documents:"documents",
                crawls:"crawls",
                tagger: "tagger",
                monitoring:"monitoring",
                params:"parameters",
                spaces:"spaces",
                imports:"import",
                stopword: "stopword",
                regex: "regex"
            }
        },
		'twitter':{
			'public_key':'xAlvPwIdeDMR5GAbL-ORMC_VlUo'
            // Authentication token, this token returned by user login to Twitter
            //,'oauth_token':null
            //,'oauth_token_secret':null
		},
        'crawl': {
            // sources available when launching a crawl
            'sources': [
                {label: "Google",value: "google",params:{country:null,language:null,from:null,to:null}}
                ,{label: "Bing",value: "bing",params:{country:null,language:null,from:null,to:null}}
                ,{label: "Twitter",value: "twitter",params:{user:null,place:null,from:null,to:null}}
                ,{label: "Rss Feed",value: "rssfeed", params:{country:null,language:null,from:null,to:null}}
                //,{label: "File System",value: "filesystem"}
                ,{label: "Facebook",value: "facebook", params:{user:null,place:null,from:null,to:null}}
                ,{label: "Deep Crawl",value: "commoncrawl",params:{country:null,language:null,from:null,to:null}}
        	],
            // Default language in which searches should be made
            language: 'fr',
            limit: null,
        },

        'countries' :[{label:"France", value:"france"},{label:"Viet Name",value:"vietnam"},{label:"China",value:"china"}],
    	'languages' :[{label:"English",value:"en"},{label:"French",value:"fr"}],

        'categorizer':{
            "defaultMethod":"AVERAGE_METHOD"
        },
        'publicRoutes':['/auth','/signup']
    });
/*
ou might see this error when you try to bind an external resource, such as vimeo, youtube, etc.
This is a new security measure in 1.2.0.
To resolve just add the following line to your AngularJS configProvider.
*/
angular.module('semdeePortal').config(
    ['$sceDelegateProvider',
    function($sceDelegateProvider) {
	  $sceDelegateProvider.resourceUrlWhitelist(['**']);
    }]
);

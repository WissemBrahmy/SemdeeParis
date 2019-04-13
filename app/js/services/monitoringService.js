/**
 * monitoringService.js
 *
 * @description ::
 *
 */

'use strict';

angular.module('semdeePortal.services')

    .factory('$monitoring', ['$q', '$semdee','$config', function($q, $semdee,$config) {
        return {
          downloadClusterCsvFile: function (clusterId) {
            var deferred = $q.defer();
            debugger
            $semdee.call({
                method: 'get',
                url: $config.api.uri.monitoring + '/cluster/' + clusterId + '/asynccsvstream',
                json: {responseType:'arraybuffer'}

            }, false).then(deferred.resolve, deferred.reject);

            return deferred.promise;

            },

          downloadCsvFile: function (monitoringId) {
            var deferred = $q.defer();

            $semdee.call({
                method: 'get',
                url: $config.api.uri.monitoring + '/' + monitoringId + '/asynccsvstream',
                json: {responseType:'arraybuffer'}

            }, false).then(deferred.resolve, deferred.reject);

            return deferred.promise;

            },


            launchMonitoring: function (json) {
                var deferred = $q.defer();
                debugger;
                // Appel à l'API pour lancer le monitoring
                console.log("starting monitoring");
                $semdee.call({
                    method: 'post',
                    url: $config.api.uri.monitoring,
                    json: json
                }, true).then(function(res) {
                    // we save monitoring id for later use
                    var monitoring = {
                        id: res.data.id,
                        status: res.data.status,
                        spaceId: res.data.spaceId,
                        beginDate:res.data.beginDate,
                        nbrclusters:res.data.numClusters
                    };

                    deferred.resolve(monitoring);
                }, deferred.reject);

                return deferred.promise;
            },

            getAllMonitorings: function (spaceId) {
                var deferred = $q.defer();

                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.monitoring+'/space/'+spaceId
                }, true).then(function (res) {
                    var monitorings = res.data;
                    deferred.resolve(monitorings);
                }, deferred.reject);

                return deferred.promise;
            },

            getClustersFromMonitoring: function (monitoringId) {
                var deferred = $q.defer();

                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.monitoring + '/' + monitoringId + '/clusters'
                }, false).then(function (res) {
                        //deferred.resolve(res);

                        var results = {
                            data: [],
                            monitoringId: null,
                            nbrClusters: 0,
                            maxNbrDocs: 0,
                            minNbrDocs: 0
                        };

                        if (res.data!=null) {

                            results = {
                                data: res.data.clusters,
                                monitoringId: res.data.monitoringId,
                                nbrClusters: res.data.numClusters,
                                maxNbrDocs: res.data.maxNbrDocs,
                                minNbrDocs: res.data.minNbrDocs
                            };
                        }

                        deferred.resolve(results);

                    }, deferred.reject
                );

                return deferred.promise;
            },

            getDocsFromCluster: function(clusterId) {
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.monitoring + '/cluster/' + clusterId + '/documents'
                }, false).then(function(res){deferred.resolve(res)}, deferred.reject);

                return deferred.promise;
            },

            getDocsFromMonitoring: function(monitoringId) {
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.monitoring + '/' + monitoringId + '/documents'
                }, false).then(function(res){deferred.resolve(res)}, deferred.reject);

                return deferred.promise;
            },

            getDocCountFromCluster: function(clusterId) {
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.monitoring + '/cluster/' + clusterId + '/documents/totalcount'
                }, false).then(function(res){deferred.resolve(res)}, deferred.reject);

                return deferred.promise;
            },

            getDocsFromClusterByPage: function(clusterId, page, size) {
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.monitoring + '/cluster/' + clusterId +
                    '/documents?page=' + page + '&size=' + size
                }, false).then(function(res){deferred.resolve(res)}, deferred.reject);

                return deferred.promise;
            },

            /**
             * Get document number from a search in a cluster with a filter.
             */
            searchClusterDocCount: function(clusterId, filter) {
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.monitoring + '/cluster/' + clusterId + 
                    '/documents/totalcount?filter=' + filter
                }, false).then(function(res){deferred.resolve(res)}, deferred.reject);

                return deferred.promise;
            },

            /**
             * Search documents in a cluster with a filter.
             */
            searchClusterDocuments: function(clusterId, filter, page, size) {
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.monitoring + '/cluster/' + clusterId +
                    '/documents?filter=' + filter + '&page=' + page + '&size=' + size
                }, false).then(function(res){deferred.resolve(res)}, deferred.reject);

                return deferred.promise;
            },

            getDocsFromMonitoringByPage: function(monitoringId, page, size) {
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.monitoring + '/' + monitoringId +
                    '/documents?page=' + page + '&size=' + size
                }, false).then(function(res){deferred.resolve(res)}, deferred.reject);

                return deferred.promise;
            },

            // search in the clustering documents
            searchMonitoringDocuments: function(monitoringId, filterValue, page, size){
              var deferred = $q.defer();
              $semdee.call({
                method: 'get',
                url: $config.api.uri.monitoring + '/' + monitoringId + '/documents?filter=' + filterValue
                + '&page=' + page + '&size=' + size,
                json:{}
              }, false).then(deferred.resolve, deferred.reject);
              return deferred.promise;
            },

            // get document count for search in the clustering documents
            searchMonitoringDocCount: function(monitoringId, filterValue, page, size){
              debugger;
              var deferred = $q.defer();
              $semdee.call({
                method: 'get',
                url: $config.api.uri.monitoring + '/' + monitoringId + '/documents/totalcount?filter=' + filterValue
                + '&page=' + page + '&size=' + size,
                json:{}
              }, false).then(deferred.resolve, deferred.reject);
              return deferred.promise;
            },

            deleteMonitoring: function(monitoringId) {
            	//alert("Missing API delete Moinitoring");
                console.log("deleteMonitoring: id="+monitoringId);
                var deferred = $q.defer();
                $semdee.call({
                    method: 'delete',
                    url: $config.api.uri.monitoring + '/' + monitoringId
                }, false).then(function(res){deferred.resolve(res)}, deferred.reject);

                return deferred.promise;
            },

            renameCluster: function(monitoringId, clusterId, clusterName){
                var deferred = $q.defer();
                $semdee.call({
                    method: 'put',
                    url: $config.api.uri.monitoring + '/' + monitoringId +'/renamecluster/' + clusterId,
                    json: angular.toJson(clusterName)
                }, false).then(function(res){deferred.resolve(res)}, function(res){deferred.reject});

                return deferred.promise;
            },

            getComputeMonitoringParameters: function(spaceId) {
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.monitoring + '/params/'+spaceId
                }, false).then(function(res){deferred.resolve(res)}, deferred.reject);

                return deferred.promise;
            },

            launchComputeMonitoringParameters: function(spaceId) {
                var deferred = $q.defer();
                $semdee.call({
                    method: 'post',
                    url: $config.api.uri.monitoring + '/params',
                    json:{'spaceId':spaceId}
                }, false).then(function(res){deferred.resolve(res)}, deferred.reject);

                return deferred.promise;
            },


            getDocsFromMonitoringOld: function(monitorId){
                debugger;
                var deferred = $q.defer();
                //var ret = deferred.promise();
                var service = this;

                return service.getClustersFromMonitoring(monitorId).then(function(res){
                    //var len = res.data.length;
                    //var cnt = 0;
                    var tabReq = [];
                    var docRet = [];
                    res.data.forEach(function(cluster){
                        var req = service.getDocsFromCluster(cluster.id).then(function(res){
                            //add 2 new fields for doc
                            for (var i=0; i<res.data.length;i++){
                                res.data[i].clusterTags = cluster.tags;
                                res.data[i].clusterName = cluster.label;
                                docRet.push(res.data[i]);
                            }
                            deferred.resolve(docRet);
                        }, deferred.reject);

                        tabReq.push(req);
                        deferred.resolve(tabReq);
                    }, deferred.reject);

                    $q.all(tabReq).then(function(res){
                        deferred.resolve(docRet);
                    },deferred.reject)

                },deferred.reject);

                return deferred.promise;
            },
        }
    }]);

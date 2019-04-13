'use strict';
angular.module("semdeePortal.controllers").controller('uploadController',

    ['$rootScope', '$scope','$location', '$interval','$crawl','$tagger','$fancyTree',
    function($rootScope, $scope,$location, $interval, $crawl, $tagger, $fancyTree) {

        var scope = $rootScope;

        $scope.uploadFrm = {

            importResults:null,
            label: null,
            file: false,
            crawls:[],
            crawlSelected:null,
            spaceSelectedTagger:null,

            // for import a file
            myFile: null,
            fileName: null,
            fileContent: null,
            addDocType:1,// new Crawl

            // for upload many files
            myFiles: [],
            filesName: [],
            filesContent: [],
            // for settings csv files by wissem
            column1:null,
            column2:null,
            column3:null,
            column4:null,
            column5:null,
            column6:null,
            Delimiter: null,
            Encoding: null,
            StartRow: null,
            isheader:null
        };
        $scope.init = function(){

            $scope.uploadFrm.importResults = null;
            $scope.uploadFrm.label = null;
            $scope.uploadFrm.file = false;

            $scope.uploadFrm.fcsvHeader=[];
            $scope.uploadFrm.crawls = [];

            $scope.uploadFrm.myFile = null;
            $scope.uploadFrm.fileName = null;
            $scope.uploadFrm.fileContent = null;
            $scope.uploadFrm.addDocType = 1;

            $scope.uploadFrm.myFiles = [];
            $scope.uploadFrm.filesName = [];
            $scope.uploadFrm.filesContent = [];

            // initialization of settings CSV by wissem
            $scope.uploadFrm.column1 = null;
            $scope.uploadFrm.column2 = null;
            $scope.uploadFrm.column3 = null;
            $scope.uploadFrm.column4 = null;
            $scope.uploadFrm.column5 = null;
            $scope.uploadFrm.column6 = null
            $scope.uploadFrm.Delimiter = null;
            $scope.uploadFrm.Encoding = null;
            $scope.uploadFrm.StartRow = null;
            $scope.uploadFrm.isheader = null
        }
// import a file csv / json
        /**
         *
         */


         // show settings  csv file wissem

         $scope.disabledColumns=[]
          $scope.findColumn = function(col) {
              var columns=[
                $scope.uploadFrm.column1,
                $scope.uploadFrm.column2,
                $scope.uploadFrm.column3,
                $scope.uploadFrm.column4,
                $scope.uploadFrm.column5,
                $scope.uploadFrm.column6,
              ]


            for (var i = 0; i < columns.length; i++) {
              if(columns[i]==col){  return true}
            }
            return false



          }




        $("#importModal").on("shown.bs.modal", function() {
            document.activeElement.blur();
            $(this).find('input.autoFocus').focus();
        }).on("hide.bs.modal", function() {
            $scope.init();
        });

        scope.onImportButton = function(){
            angular.element("#importModal span.importStatus")
                .removeClass('glyphicon glyphicon-refresh glyphicon-refresh-animate')
                .addClass('fa fa-folder-open');

            $('#importModal').modal("show");

        }

        // select file to upload on server (import file csv)
        scope.onImportFile = function(){

            if ($scope.uploadFrm.importResults != null
                && $scope.uploadFrm.importResults.length > 0){
                $('#importModal').modal("toggle");
                $scope.uploadFrm.importResults = null;
                return;
            }

            angular.element("#importModal span.importStatus")
                .removeClass('fa fa-folder-open')
                .addClass('glyphicon glyphicon-refresh glyphicon-refresh-animate');

            //if (scope.activeNode.data.type=="ROOT1"){

                if ($scope.isCSVFile($scope.uploadFrm.myFile)){

                    // add empty crawls, label of this crawl is file name
                    var name = $scope.uploadFrm.label;
                    var json = {
                        limit:0,
                        language:"fr",
                        name:name,
                        source:"filesystem",
                        query:name
                    };

                    // create new empty crawl
                    $crawl.addCrawl(json).then(
                        function(res){

                            var newCrawlId = res.id;

                            console.log("empty crawl id="+newCrawlId);
                            var content = $scope.uploadFrm.fileContent;

                            // read header csv by wissem
                            var header=content.split("\n")[0].split(';');
                            for (var i = 0; i < header.length; i++) {
                              //$scope.uploadFrm.fcsvHeader.push(header[i])
                            //  var data =   $scope.uploadFrm.fcsvHeader;
                            }

                            // params of form into object by wissem
                            var settings={
                              Delimiter:$scope.uploadFrm.Delimiter,
                              Encoding:$scope.uploadFrm.Encoding,
                              isheader:$scope.uploadFrm.isheader,
                              StartRow:$scope.uploadFrm.StartRow,
                              columns:[
                                {column1:$scope.uploadFrm.column1},
                                {column2:$scope.uploadFrm.column2},
                                {column3:$scope.uploadFrm.column3},
                                {column4:$scope.uploadFrm.column4},
                                {column5:$scope.uploadFrm.column5},
                                {column6:$scope.uploadFrm.column6},
                              ]


                            }


                            //$crawl.importFileContent(newCrawlId, content).then(
                            $crawl.importFileContentWithSettings(newCrawlId, content,settings).then(
                                function (res) {

                                    console.log(res);

                                    $scope.uploadFrm.importResults = [];

                                    if (res && res.status == 200) { // success

                                        //reload tree with new Crawl
                                        if (scope.activeNode && scope.activeNode.data.type=="ROOT1") {

                                            scope.activeNode.load(true).then(function () {
                                                scope.sortDirAsc = false;
                                                scope.sortTree(1); //date
                                                scope.activeNode.setExpanded();
                                            });
                                        }

                                        // reload list crawls for Creating New Cognitive Space
                                        $crawl.getAllCrawls(false).then(function(crawls) {
                                            scope.crawls = crawls;

                                        }, function(res) {
                                            alert('Error while loading user crawls. Please check server state');
                                        });


                                        $scope.uploadFrm.importResults.push('successful import');

                                    }
                                    else{// if (res.status == 500) {// errors
                                        // remove this crawl
                                        $crawl.removeCrawl(newCrawlId).then(
                                            function(res){
                                                if (res.data == false) {
                                                    alert("Existing space with this crawl.");
                                                }
                                            },
                                            function(err){
                                               alert("Delete failed: " + err);
                                            }
                                        );

                                        $scope.uploadFrm.importResults.push('import problem');
                                        angular.forEach(res.errors, function (value, key) {
                                            $scope.uploadFrm.importResults.push(value);
                                        });

                                    }
                                },
                                function(err){
                                    console.log("test import and delete crawl 1");
                                }
                            );
                        },
                        function(res){
                            console.log(res);
                            alert('add Crawls problem');
                        }
                    );

                }
                else{
                    $scope.uploadFrm.importResults = [];
                    $scope.uploadFrm.importResults.push('Please select .csv file to import');
                }
           // }
        }

        // import files doc, pdf
        $("#uploadModal").on("show.bs.modal", function() {

            if(scope.activeCrawl){
                $scope.uploadFrm.crawlSelected = scope.activeCrawl;
                $scope.uploadFrm.addDocType = 2;
            }

            if ($scope.uploadFrm.crawlSelected==null){
                $('#cbxAddDocCrawl button.dropdown-toggle span.pull-left.filter-option').text('Select a Original Data');
                $('#cbxAddDocCrawl div.dropdown-menu.open div.bs-searchbox input.form-control').val('');
            }

            $scope.uploadFrm.crawls = [];
            scope.allCrawls.forEach(
                function (crawl, idx) {
                    if (crawl.status == 2){
                        $scope.uploadFrm.crawls.push(crawl);
                    }
                }
            );
        }).on("shown.bs.modal", function() {
            document.activeElement.blur();
            $(this).find('input.autoFocus').focus();

        }).on("hide.bs.modal", function() {
            $scope.init();
        });

        scope.onUploadButton = function(){
            angular.element("#uploadModal span.importStatus")
                .removeClass('glyphicon glyphicon-refresh glyphicon-refresh-animate')
                .addClass('fa fa-folder-open');

            $('#uploadModal').modal("show");
        }

        // import files pst, eml, msg
        $("#uploadEmailModal").on("show.bs.modal", function() {

            if(scope.activeCrawl){
                $scope.uploadFrm.crawlSelected = scope.activeCrawl;
                $scope.uploadFrm.addDocType = 2;
            }

            if ($scope.uploadFrm.crawlSelected==null){
                $('#cbxAddDocCrawl button.dropdown-toggle span.pull-left.filter-option').text('Select a Original Data');
                $('#cbxAddDocCrawl div.dropdown-menu.open div.bs-searchbox input.form-control').val('');
            }

            $scope.uploadFrm.crawls = [];
            scope.allCrawls.forEach(
                function (crawl, idx) {
                    if (crawl.status == 2){
                        $scope.uploadFrm.crawls.push(crawl);
                    }
                }
            );
        }).on("shown.bs.modal", function() {
            document.activeElement.blur();
            $(this).find('input.autoFocus').focus();

        }).on("hide.bs.modal", function() {
            $scope.init();
        });

        scope.onUploadEmailButton = function(){
            angular.element("#uploadEmailModal span.importStatus")
                .removeClass('glyphicon glyphicon-refresh glyphicon-refresh-animate')
                .addClass('fa fa-folder-open');

            $('#uploadEmailModal').modal("show");
        }

        scope.onChangeAddDocumentType = function(){
            if ($scope.uploadFrm.addDocType==1){// select option add doc into new crawl

                $('#crawlName').focus();

                $scope.uploadFrm.crawlSelected = null;
                $('#cbxAddDocCrawl button.dropdown-toggle span.pull-left.filter-option').text('Select a Original Data');
                $('#cbxAddDocCrawl div.dropdown-menu.open div.bs-searchbox input.form-control').val('');
            }
            else if ($scope.uploadFrm.addDocType==2){// select option add doc into selected crawl
                $scope.uploadFrm.label = null;
            }

        }


        /**
         * Function to call when OK button from "Import Documents" dialogoue
         * is clicked. To upload files in doc, docx, and pdf formats.
         */
        scope.onUploadFiles = function(){
          //debugger;
            if ($scope.uploadFrm.importResults != null
                && $scope.uploadFrm.importResults.length > 0){
                $('#uploadModal').modal("toggle");
                $scope.uploadFrm.importResults = null;
                return;
            }

            angular.element("#uploadModal span.importStatus")
                .removeClass('fa fa-folder-open')
                .addClass('glyphicon glyphicon-refresh glyphicon-refresh-animate');

        //    console.log("=="+$scope.uploadFrm.addDocType);
            var language = {'value':'fr'};
            if ($scope.crawlForm != null){
                language = $scope.crawlForm.params.languages.length>0 ?
                $scope.crawlForm.params.languages[0]:null;
            }
            var lan = language.value;
            if ($scope.uploadFrm.addDocType==1){// add document into new Crawl

            //    console.log("1=="+$scope.uploadFrm.label);
                // 1. Create new empty Crawl
                var name = $scope.uploadFrm.label;
                var json = {
                    limit:0, // changed from 100 to 0, to avoid extra 100 to the
                             // to the number of documents in the crawl.
                    language:language=!null?language.value:"fr",
                    name:name,
                    source:"filesystem",
                    query:name
                };

                $crawl.addCrawl(json).then(
                    function(res){
                        var newCrawlId = res.id;
                        console.log("empty crawl id="+newCrawlId);
                        // 2. Add document into new Crawl
                        scope.addFilesToCrawl(newCrawlId, true, lan);

                    },
                    function(res){
                        console.log(res);

                        if ($scope.uploadFrm.importResults ==null){
                            $scope.uploadFrm.importResults = [];
                        }
                        $scope.uploadFrm.importResults.push('add Crawls problem');
                    }
                );
            }
            else if ($scope.uploadFrm.addDocType==2){// add document into selected Crawl

          //      console.log("2=="+$scope.uploadFrm.crawlSelected.id);

                scope.addFilesToCrawl($scope.uploadFrm.crawlSelected.id, false, lan);
            }


        }// onUploadFiles()

        /**
         * add files to a crawl.
         */
        scope.addFilesToCrawl = function(crawlId, isCreateNewCrawl, language){
          //var language = $scope.crawlForm.params.languages.length>0 ?
              //$scope.crawlForm.params.languages[0].value:"fr";
            $scope.uploadFrm.myFiles.forEach(

                function (file, idx) {

                    var content = $scope.uploadFrm.filesContent[idx];
                    var sizeContent = content.length;
                    //var language = $scope.uploadFrm.languages[0]
                    //var fileName = $scope.uploadFrm.filesName[idx];

                    //$crawl.addFileToCrawl($scope.uploadFrm.crawlSelected.id, content).then(
                    $crawl.addFileToCrawlWithFileName(crawlId, content, file.name, language).then(
                    //$crawl.addFileToCrawl(crawlId, content).then(
                        function (res) {

                            console.log(res);

                            if ($scope.uploadFrm.importResults ==null){
                                $scope.uploadFrm.importResults = [];
                            }

                            if (res.status == 200) { // success
                                $scope.uploadFrm.importResults.push('Successfully Imported File:'+file.name);

                                // reload list document of current crawl
                                if (scope.activeNode && scope.activeNode.data.type=='CRAWL'){
                                    if (crawlId == scope.activeNode.data.id) {
                                        $crawl.getCrawlResult({id: scope.activeNode.data.id}).then(function (res) {
                                            scope.documents = res.data;
                                        });
                                    }
                                }

                                if (isCreateNewCrawl){
                                    // add new crawl into tree
                                    //load tree
                                    $fancyTree.getNodeByKey("ROOT1").load(true).then(function(){
                                        $fancyTree.resize();
                                        scope.sortDirAsc = false;
                                        scope.sortTree(1); //sort by date
                                    })

                                    // reload list crawls for Creating New Cognitive Space
                                    $crawl.getAllCrawls(false).then(function(crawls) {
                                        scope.crawls = crawls;

                                    }, function(res) {
                                        alert('Error while loading user crawls. Please check server state');
                                    });

                                }

                            }
                            else{// if (res.status == 500) {// errors
                                $scope.uploadFrm.importResults.push('Could Not Import File: '+file.name);
                                angular.forEach(res.errors, function (value, key) {
                                    $scope.uploadFrm.importResults.push(value);
                                });
                            }
                        }
                    );

                }
            );

        }// addFilesToCrawl


        /**
         * Function to call when OK button from "Import Email Files" dialogoue
         * is clicked. To upload email files in pst, eml, and msg formats.
         */
        scope.onUploadEmailFiles = function(){
          //debugger;
            if ($scope.uploadFrm.importResults != null
                && $scope.uploadFrm.importResults.length > 0){
                $('#uploadEmailModal').modal("toggle");
                $scope.uploadFrm.importResults = null;
                return;
            }

            angular.element("#uploadEmailModal span.importStatus")
                .removeClass('fa fa-folder-open')
                .addClass('glyphicon glyphicon-refresh glyphicon-refresh-animate');

        //    console.log("=="+$scope.uploadFrm.addDocType);
            var language = {'value':'fr'};
            if ($scope.crawlForm != null){
               language = $scope.crawlForm.params.languages.length>0 ?
                    $scope.crawlForm.params.languages[0]:null;
            }
            var lan = language.value;
            if ($scope.uploadFrm.addDocType==1){// add document into new Crawl

            //    console.log("1=="+$scope.uploadFrm.label);
                // 1. Create new empty Crawl
                var name = $scope.uploadFrm.label;
                var json = {
                    limit:0, // changed from 100 to 0, to avoid extra 100 to the
                             // to the number of documents in the crawl.
                    language:language=!null?language.value:"fr",
                    name:name,
                    source:"filesystem",
                    query:name
                };

                $crawl.addCrawl(json).then(
                    function(res){
                        var newCrawlId = res.id;
                        console.log("empty crawl id="+newCrawlId);
                        // 2. Add document into new Crawl
                        scope.addEmailFilesToCrawl(newCrawlId, true, lan);

                    },
                    function(res){
                        console.log(res);

                        if ($scope.uploadFrm.importResults ==null){
                            $scope.uploadFrm.importResults = [];
                        }
                        $scope.uploadFrm.importResults.push('add Crawl problem');
                    }
                );
            }
            else if ($scope.uploadFrm.addDocType==2){// add document into selected Crawl

          //      console.log("2=="+$scope.uploadFrm.crawlSelected.id);

                scope.addEmailFilesToCrawl($scope.uploadFrm.crawlSelected.id, false, lan);
            }


        }// onUploadEmailFiles()

        /**
         * add Email files to a crawl.
         */
        scope.addEmailFilesToCrawl = function(crawlId, isCreateNewCrawl, language){
          //var language = $scope.crawlForm.params.languages.length>0 ?
              //$scope.crawlForm.params.languages[0].value:"fr";
            $scope.uploadFrm.myFiles.forEach(

                function (file, idx) {

                    var content = $scope.uploadFrm.filesContent[idx];
                    var sizeContent = content.length;
                    //var language = $scope.uploadFrm.languages[0]
                    //var fileName = $scope.uploadFrm.filesName[idx];

                    //$crawl.addFileToCrawl($scope.uploadFrm.crawlSelected.id, content).then(
                    $crawl.addEmailFileToCrawl(crawlId, content, language).then(
                    //$crawl.addFileToCrawl(crawlId, content).then(
                        function (res) {

                            console.log(res);

                            if ($scope.uploadFrm.importResults ==null){
                                $scope.uploadFrm.importResults = [];
                            }

                            if (res.status == 200) { // success
                                $scope.uploadFrm.importResults.push('Successfully Imported Email File:'+file.name);

                                // reload list document of current crawl
                                if (scope.activeNode && scope.activeNode.data.type=='CRAWL'){
                                    if (crawlId == scope.activeNode.data.id) {
                                        $crawl.getCrawlResult({id: scope.activeNode.data.id}).then(function (res) {
                                            scope.documents = res.data;
                                        });
                                    }
                                }

                                if (isCreateNewCrawl){
                                    // add new crawl into tree
                                    //load tree
                                    $fancyTree.getNodeByKey("ROOT1").load(true).then(function(){
                                        $fancyTree.resize();
                                        scope.sortDirAsc = false;
                                        scope.sortTree(1); //sort by date
                                    })

                                    // reload list crawls for Creating New Cognitive Space
                                    $crawl.getAllCrawls(false).then(function(crawls) {
                                        scope.crawls = crawls;

                                    }, function(res) {
                                        alert('Error while loading user crawls. Please check server state');
                                    });

                                }

                            }
                            else{// if (res.status == 500) {// errors
                                $scope.uploadFrm.importResults.push('Could Not Import Email File: '+file.name);
                                angular.forEach(res.errors, function (value, key) {
                                    $scope.uploadFrm.importResults.push(value);
                                });
                            }
                        }
                    );

                }
            );

        }// addEmailFileToCrawl


        scope.removeUploadFile = function(idx){
            $scope.uploadFrm.filesName.splice(idx,1);
            $scope.uploadFrm.filesContent.splice(idx,1);
            $scope.uploadFrm.myFiles.splice(idx,1);
            if ($scope.uploadFrm.myFiles.length==0 && $scope.uploadFrm.filesName.length==0){
                $scope.uploadFrm.file = false;
            }

        }

// tagger a file
        /**
         *
         */
        $("#taggerModal").on("show.bs.modal", function() {

            if(scope.activeSpace){
                $scope.uploadFrm.spaceSelectedTagger = scope.activeSpace;
            }

            $scope.uploadFrm.crawls = [];
            scope.allCrawls.forEach(
                function (crawl, idx) {
                    if (crawl.status == 2){
                        $scope.uploadFrm.crawls.push(crawl);
                    }
                }
            );
        }).on("shown.bs.modal", function() {
            document.activeElement.blur();
        }).on("hide.bs.modal", function() {
            $scope.init();
        });

        scope.onTaggerButton = function(){
            angular.element("#taggerModal span.importStatus")
                .removeClass('glyphicon glyphicon-refresh glyphicon-refresh-animate')
                .addClass('fa fa-folder-open');

            $('#taggerModal').modal("show");

        }

        // select file to upload on server (import file csv)
        scope.onTaggerFile = function() {
            console.log('onTaggerFile');

            if ($scope.uploadFrm.importResults != null
                && $scope.uploadFrm.importResults.length > 0) {
                $('#taggerModal').modal("toggle");
                $scope.uploadFrm.importResults = null;
                return;
            }

            angular.element("#taggerModal span.importStatus")
                .removeClass('fa fa-folder-open')
                .addClass('glyphicon glyphicon-refresh glyphicon-refresh-animate');

            var content = $scope.uploadFrm.fileContent;

            $tagger.launchTaggerWithFile($scope.uploadFrm.spaceSelectedTagger.id, content).then(

                function (res) {

                    $scope.uploadFrm.importResults = [];

                    if (res) {

                        console.log(res);

                        if (res.status == 200) { // success
                            $scope.uploadFrm.importResults.push('successful tagger');
                        }
                        else {// if (res.status == 500) {// errors
                            $scope.uploadFrm.importResults.push('tagger problem');
                            angular.forEach(res.errors, function (value, key) {
                                $scope.uploadFrm.importResults.push(value);
                            });
                        }
                    }
                    else{
                        $scope.uploadFrm.importResults.push('tagger problem : IllegalArgumentException');
                    }
                }
            );

        }

/************************************************************/

        $scope.isCSVFile = function(file){
            // Make sure `file.name` matches our extensions criteria (if ( /\.(jpe?g|png|gif)$/i.test(file.name) ) {)
            if (file != null) {
                if ( /\.(csv)$/i.test(file.name) || file.type == 'application/vnd.ms-excel' ){
                    return true;
                }
            }
            return false;
        }

    }]);
    $scope.detectCSV = function (chunk, opts) {
      opts = opts || {}
      if (Buffer.isBuffer(chunk)) chunk = chunk + ''
      var delimiters = opts.delimiters || [',', ';', '\t', '|']
      var newlines = opts.newlines || ['\n', '\r']

      var lines = chunk.split(/[\n\r]+/g)

      var delimiter = determineMost(lines[0], delimiters)
      var newline = determineMost(chunk, newlines)

      if (!delimiter) {
        if (isQuoted(lines[0])) return { newline: newline }
        return null
      }

      return {
        delimiter: delimiter,
        newline: newline
      }
    }

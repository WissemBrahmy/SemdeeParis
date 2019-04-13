"use strict";
angular.module('semdeePortal.filters')
    .filter('filterDocumentByCategory', function() {

        return function(items, category) {
            if (angular.isUndefined(category)){// category is not selected, return empty data
                return [];
            }
            var filtered = [];
            for(var i=0;i<items.length;i++){

                // found this document contains selected category id
                if (items[i].idCategories.indexOf(category.id) >= 0){
                    filtered.push(items[i]);
                }
            }
            return filtered;
        };
    });
angular.module('semdeePortal.filters')
    .filter('filterDocumentsSelected', function() {

        return function(items, category, documents) {

            if (angular.isUndefined(category)){// category is not selected, return all searchResult data
                return items;
            }

            // get all selected documents of selected category
            var selectedDocumentIds = [];
            for(var i=0;i<documents.length;i++){
                if (documents[i].idCategories.indexOf(category.id) >= 0){
                    selectedDocumentIds.push(documents[i].id);
                }
            }

            var filtered = [];
            for(var i=0;i<items.length;i++){
                // this document is not selected
                if (selectedDocumentIds.indexOf(items[i].id) == -1){
                    filtered.push(items[i]);
                }
            }
            return filtered;
        };
    });

angular.module('semdeePortal.filters')
    .filter('containsDocument', function() {

        return function(categories, documents) {

            var listCategoriesId = [];
            // get list categories id in list selected documents
            documents.forEach(
                function (doc) {
                    doc.idCategories.forEach(
                        function(catid){
                            if (listCategoriesId.indexOf(catid) < 0){
                                listCategoriesId[catid] = catid;
                            }
                        }
                    );
                }
            );

            // get list categories that contains documents
            var filtered = [];
            for(var i=0;i<categories.length;i++){
                if (listCategoriesId.indexOf(categories[i].id) >= 0){
                    filtered.push(categories[i]);
                }
            }
            return filtered;
        };
    });

angular.module('semdeePortal.filters').filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                //Also remove . and , so its gives a cleaner result.
                if (value.charAt(lastspace-1) == '.' || value.charAt(lastspace-1) == ',') {
                    lastspace = lastspace - 1;
                }
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
});

function convertDate(strInput) {
    var pattern = /(\d{2})-(\d{2})-(\d{4})/; //var pattern = /(\d{4})(\d{2})(\d{2})/;
    return new Date(strInput.replace(pattern, '$3-$2-$1T00:00:01.000+0000'));
}
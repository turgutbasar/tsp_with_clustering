define(['jquery'], function ($) {
'use strict'
    var DBRest = function () { };

    DBRest.query = function (data, success, error) {
		
		$.ajax({
			url: 'http://test.sb10.stations.graphenedb.com:24789/db/data/transaction/commit',
			headers: { 
				Accept : 'application/json',
				Authorization: 'Basic ' + btoa('Test' + ':' + '7xySYaN81CC20tfw0uQG')
			},
			contentType:'application/json',
			type:'POST',
			data:data,
			success:success, 
			error:error
		});
		
    };
    
    return DBRest;
});

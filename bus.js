var request = require('request');
var async = require('async');

/*request.get('http://api.prod.obanyc.com/api/siri/vehicle-monitoring.json?LineRef=B62&key=fa97a9a3-c76f-4711-92d1-927160e6cd89', function(err,res){
    if(err){console.log(err)}
    
    var response = JSON.parse(res.body);
    var deets = response.Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity;
    //console.log(response.Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity)
    for(i in deets){
        if(deets[i].MonitoredVehicleJourney.DestinationName = 'LI CITY QUEENS PLAZA'){
           console.log(deets[i].MonitoredVehicleJourney.MonitoredCall) ;
        }
    }
})*/

//exports.schedule = function(cb){

var stopCode = "305181";
var cron = require('cron').CronJob;
console.log('started bus runner')
var job = new cron('00 30 14 * * 1-5', function(){
    request.get('http://bustime.mta.info/api/siri/stop-monitoring.json?MonitoringRef='+stopCode+'&key=fa97a9a3-c76f-4711-92d1-927160e6cd89', function(err,res){
        if(err){console.log(err)}
        var silo = [];
        var counter = 0;

        var response = JSON.parse(res.body);
        var deets = response.Siri.ServiceDelivery.StopMonitoringDelivery;
        
        //return cb(deets[0].MonitoredStopVisit)
        async.series([
            function(callback){
                deets[0].MonitoredStopVisit.map(function(element){
                    counter++
                    silo.push(element.MonitoredVehicleJourney.MonitoredCall.Extensions.Distances.PresentableDistance)
                    if(counter == deets[0].MonitoredStopVisit.length){
                        console.log('reached callback');
                        callback();
                    }
                })     
            },
            function(callback){
                var accountSid = 'ACaacd830b4b6d71fd997b070bddb2d8ea';
                var authToken = 'c54316f72630f12f38d424e3166bfb54'
                var client = require('twilio')(accountSid,authToken);

                        client.messages.create({
                            body: 'The first bus is '+silo[0]+' | The second bus is '+silo[1]+' | The bus after that is '+silo[2],
                            to: '+17575981397',
                            from:'+17577726616'
                        }, function(err,message){
                            if(err){console.log(err)}
                            console.log(message)
                        })
            }
        ])
    })
},null,true,'America/New_York')
    
//}
var request = require('request'),
    async = require('async'),
    mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient,
    Server = require('mongodb').Server,
    MONGOHQ_URL="mongodb://worker:walton@oceanic.mongohq.com:10048/partyofme";

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
    
    //*****************************WEATHER FOR THE DAY
    var weatherJob = new cron('00 00 11 * * 1-7', function(){
        console.log('started cron job')
        db.collection('weatherUsers').find({}).toArray(function(err,doc){
            if(err){console.log(err)}

            doc.map(function(element){
                if(element.name != null){
                    console.log(element);
                    var apikey = 'e5dd01df71d7fc88812e565893fa2e77'
                    var request = require('request')
                    //FOR SOME REASON THIS WORKS WITHOUT THE API KEY - CHANGE FROM DOCS I GUESS
                    //IN THIS REQUEST WE NEED TO TAKE IN THE ADDRESS FROM THE EXTERNAL USER INFORMATION - THAT SHOULD BE ALL WE NEED
                    request.get('https://maps.googleapis.com/maps/api/geocode/json?address=Brooklyn+NY', function(err,res,body){
                        var parsed = JSON.parse(body);
                        console.log(body)
                        var lat = parsed.results[0].geometry.location.lat;
                        var long = parsed.results[0].geometry.location.lng;
                        var url = 'https://api.forecast.io/forecast/'+apikey+'/'+lat+','+long;
                        request.get(url,function(err,res,body2){
                            var weatherparse = JSON.parse(body2)
                            console.log(weatherparse.currently.summary);
                            //TWILIO SECTION

                            var twilio = require('twilio');

                            var accountSid = 'ACaacd830b4b6d71fd997b070bddb2d8ea';
                            var authToken = 'c54316f72630f12f38d424e3166bfb54'

                            var client = require('twilio')(accountSid,authToken);

                            client.messages.create({
                                body: 'Hi '+element.name+' Currently it is '+weatherparse.currently.summary+' and around '+weatherparse.currently.temperature+' degrees F | '+weatherparse.hourly.summary,
                                to: '+1'+element.telephone,
                                from:'+17577726616'
                            }, function(err,message){
                                if(err){console.log(err)}
                                console.log(message)
                            })
                        })
                    })
                }
            })
        })
    }, null,true,"America/New_York")


    //****************************THE BUS GOING TO WORK

    var stopCode = "305181";
    var stopCodeHome = "305183";
    var cron = require('cron').CronJob;
    console.log('started bus runner')
    var job = new cron('00 00 13 * * 1-5', function(){
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

        /*
    *****************************************************************************
    ******************************************THE BUS GOING HOME *****************************************************************************
    */
    var job = new cron('00 30 22 * * 1-5', function(){
            request.get('http://bustime.mta.info/api/siri/stop-monitoring.json?MonitoringRef='+stopCodeHome+'&key=fa97a9a3-c76f-4711-92d1-927160e6cd89', function(err,res){
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

})
    
//}
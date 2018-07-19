const rp = require('request-promise-native')
const r = require('request')
const schedule = require('node-schedule');
const mongoist = require('mongoist');
const mongojs = require('mongojs')
//var pmongo = require('promised-mongo');
//var db = pmongo('mongodb://bank2538:bank2538!@ds141661.mlab.com:41661/trippoint', ['trip','users']);
const mongojsDb =  mongojs('mongodb://bank2538:bank2538!@ds141661.mlab.com:41661/trippoint', ['trip','users'])
const db = mongoist(mongojsDb);
//const db = mongoist('mongodb://bank2538:bank2538!@ds141661.mlab.com:41661/trippoint')
//const db = mongojs('mongodb://bank2538:bank2538!@ds141661.mlab.com:41661/trippoint', ['trip','users'])


const TP_URL = 'https://www.trippointz.com/1minutecontest/vote/143';
const url = 'https://www.trippointz.com/'

/*var userHash = [
    'aa6917435437cc49aa37e6166ac0ca9db8233cd3',
    '1a77ad924cf34787e2899ffa4d52f1381fc4abd1',
    'd68c79dd02edc33a6ee8a3b79b5261d1fce88cdb',
    '18068bc70f4ee0399988d54230f67f557fc083cc',
    '6c2b258311f0374bb290ff5f7605475db5ff5c8b',
    '1db9d7d562049f3b5969a03aa281e18cef2e4d95',
    'fa44797928113690b49bf31429b32b017f4da57e',
    'c642f2b7e15557a6d6d7ac76ff10bfb713a95942',
    '10808f799ac5483581040fc64b30bbcb1dc0c7eb',
    'e8deee0a9ee51325e1dd9490599b832579ef138b',
];*/

/*setInterval(() => {
  run()
},5000)*/
const timer = ms => new Promise( res => setTimeout(res, ms));

/*async function getData() {
    return await db.users.find({})
}*/

       /*console.log("wait")
        await timer(10000)
        console.log("go")
        let count = 0;
        users.forEach(user => {
            let cookieJar = r.jar()
            let cookie = r.cookie('user_hash='+user.user_id)
            cookieJar.setCookie(cookie, url)
        
            login(cookieJar).then((res) => {
                let data = JSON.parse(res);
                if (data.status === 'error') {
                    count = count + 1
                    console.log({'user_id':user.user_id, 'status':'error', message: data.error, date: new Date()})
                    db.trip.insert({user_id: user.user_id, status: 'error', message: data.error, date: new Date()})
                } else {
                    db.trip.insert({user_id: user.user_id, status: 'success', date: new Date()})
                    console.log({'user_id':user.user_id, 'status':'success', date: new Date()})
                }
            }) 
        });*/

const httpOptions = {
    Post: function (cookieObject, formData) {
        return {
            method: 'Post',
            followAllRedirects: true,
            formData: formData,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36',
            },
            jar: cookieObject
        }
    },
    Get: function (cookieObject) {
        return {
            method: 'Get',
            followAllRedirects: true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36',
            },
            jar: cookieObject
        }
    }
}

function login(cookieJar) {
    return rp(TP_URL, httpOptions.Get(cookieJar)).then((r1) => {
        return r1
    })
}

async function excute(users) {
    let userError = []
    console.log("wait")
    console.log("go")
    users.forEach(user => {
        let cookieJar = r.jar()
        let cookie = r.cookie('user_hash='+user.user_id)
        cookieJar.setCookie(cookie, url)
        login(cookieJar).then((res) => {
            let data = JSON.parse(res);
            if (data.status === 'error') {
                userError.push({'user_id':user.user_id})
                console.log({'user_id':user.user_id, 'status':'error', message: data.error, date: new Date()})
                db.trip.insert({user_id: user.user_id, status: 'error', message: data.error, date: new Date()})
            } else {
                db.trip.insert({user_id: user.user_id, status: 'success', date: new Date()})
                console.log({'user_id':user.user_id, 'status':'success', date: new Date()})
            }
        }) 
    });
    await timer(10000)
    return userError
}

async function runaway(users,i) {
    console.log(i)
    let userError = await excute(users)
    if (userError.length > 0) {
        if (i > 10) {
            return true
        } else {
            console.log("runaway")
            runaway(userError,i+1)
        }
    } else {
        console.log("success")
        return true
    }
}

async function run() {
    let users = await db.users.find({})
    runaway(users,1)
}

run()

schedule.scheduleJob('* */2 * * *', function(){
    run()
});
/*

setInterval(() => {
    userHash.forEach(user_id => {

        let cookieJar = r.jar()
        let cookie = r.cookie('user_hash='+user_id)
        cookieJar.setCookie(cookie, url)
    
        login(cookieJar).then((res) => {
            let data = JSON.parse(res);
            if (data.status === 'error') {
                console.log('error')
                db.trip.insert({name: 'error'})
            } else {
                db.trip.insert({name: 'success'})
                console.log('success')
            }
        })  
    });

},5000)
*/



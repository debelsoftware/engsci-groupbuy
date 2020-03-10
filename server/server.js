const express = require('express');
const http = require('http');
const https = require('https');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client('804968743153-a76a3a3qm2fekd3eu9ldceied1vqgelb.apps.googleusercontent.com');
const shortid = require('shortid');

let app = express();
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

let connection;

function connectToDB() {
  connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		database: 'groupbuy',
		password: 'groupbuy',
		multipleStatements: true,
		supportBigNumbers: true
  });

  connection.connect(function(err) {
    if(err) {
      console.log('database connection error:', err);
      setTimeout(connectToDB, 2000);
    }
    else {
      console.log("!!Connected to DB!!");
    }
  });

  connection.on('error', function(err) {
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('Attempting connection to DB');
      connectToDB();
    } else {
      throw err;
    }
  });
}

connectToDB();

const httpServer = http.createServer(app);

httpServer.listen(80, () => {
	console.log('HTTP Server running on port 80');
});

async function verify(token) {
  try{
    let ticket = await client.verifyIdToken({
        idToken: token,
        audience: '804968743153-a76a3a3qm2fekd3eu9ldceied1vqgelb.apps.googleusercontent.com',
    });
    let payload = ticket.getPayload();
    let userid = payload['sub'];
    return userid;
  }
  catch(e){
    return "error"
  }
}

app.get('/groupcount', returnGroupData);
app.post('/submitorder', submitOrder);
app.post('/orderdetails', returnOrderDetails);
app.post('/admin/orders', returnOrders);
app.post('/admin/groups', returnGroups);

async function getRequiredGroup(productID){
  let [rows, fields] = await connection.promise().query('SELECT requiredGroup FROM products WHERE productID = ?',[productID])
  if (rows.length == 0){
    return "err"
  }
  else {
    return rows;
  }
}

async function getGroupSize(productID){
  let [rows, fields] = await connection.promise().query('SELECT COUNT(orderID) as groupSize FROM orders WHERE productID = ? and groupID IS NULL',[productID])
  if (rows.length == 0){
    return "err"
  }
  else {
    return rows;
  }
}

async function getOrderDetails(orderID,googleID){
  let [rows, fields] = await connection.promise().query('SELECT productID, orderTime, groupID FROM orders WHERE orderID = ? and userID = ?',[orderID, googleID])
  if (rows.length == 0){
    return "err"
  }
  else {
    return rows;
  }
}

async function checkGroupNumbers(productID){
  const requiredGroup = await getRequiredGroup(productID);
  const groupSize = await getGroupSize(productID);
  if (requiredGroup == "err" || groupSize == "err") {
    return "err"
  }
  else {
    console.log("checking size");
    console.log(parseInt(groupSize.groupSize));
    console.log(parseInt(requiredGroup.requiredGroup));
    if (parseInt(groupSize[0].groupSize) == parseInt(requiredGroup[0].requiredGroup)) {
      console.log("size equal");
      return createGroup(productID)
    }
  }
}

async function createGroup(productID){
  const groupID = shortid.generate();
  let [rows, fields, err] = await connection.promise().query('INSERT INTO groups VALUES(?,?)',[groupID,productID])
  if (err) {
    console.log(err);
    return "err"
  }
  else {
    console.log("created group");
    let [rows, fields, err] = await connection.promise().query('UPDATE orders SET groupID = ? WHERE productID = ? AND groupID IS NULL',[groupID,productID])
    if (err){
      console.log(err);
      return "err"
    }
    else {
      console.log("added orders to group");
      return groupID;
    }
  }
}

//-------------------API RESPONSES-----------------------------
async function returnGroupData(req,res,next){
  const requiredGroup = await getRequiredGroup(req.query.productID);
  const groupSize = await getGroupSize(req.query.productID);
  if (requiredGroup == "err" || groupSize == "err") {
    res.sendStatus(400)
  }
  else {
    res.json({
      requiredGroup: requiredGroup[0].requiredGroup,
      currentGroup: groupSize[0].groupSize
    });
  }
}

async function submitOrder(req,res,next){
  const orderID = shortid.generate();
  const googleID = await verify(req.body.token)
  if (googleID != "e" && googleID != "error") {
    connection.query('INSERT INTO orders VALUES(?,?,?,?,?)',[orderID,req.body.productID,googleID,Math.round((new Date()).getTime() / 1000),null],
  	function(err, results, fields) {
  		if (err) {
  			console.log(err);
        res.sendStatus(400);
  		}
      else {
        checkGroupNumbers(req.body.productID);
        res.json({
          orderID: orderID
        })
      }
  	});
  }
  else {
    res.sendStatus(401);
  }
}

async function returnOrders(req,res,next){
  connection.query('SELECT * FROM orders WHERE productID = ?',[req.body.productID],
  function(err, results, fields) {
  	if (err) {
  		console.log(err);
      res.sendStatus(400);
  	}
    else {
      res.json(results)
    }
	});
}

async function returnGroups(req,res,next){
  connection.query('SELECT * FROM groups WHERE productID = ?',[req.body.productID],
  function(err, results, fields) {
  	if (err) {
  		console.log(err);
      res.sendStatus(400);
  	}
    else {
      res.json(results)
    }
	});
}

async function returnOrderDetails(req,res,next){
  const googleID = await verify(req.body.token)
  if (googleID != "e" && googleID != "error") {
    const orderDetails = await getOrderDetails(req.body.orderID, googleID)
    if (orderDetails == "err") {
      res.sendStatus(400)
    }
    else {
      const requiredGroup = await getRequiredGroup(orderDetails[0].productID);
      const groupSize = await getGroupSize(orderDetails[0].productID);
      if (requiredGroup == "err" || groupSize == "err") {
        res.sendStatus(400)
      }
      else {
        res.json({
          requiredGroup: requiredGroup[0].requiredGroup,
          currentGroup: groupSize[0].groupSize,
          orderDetails: orderDetails[0]
        });
      }
    }
  }
  else {
    res.sendStatus(400)
  }
}

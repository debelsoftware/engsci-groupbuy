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
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
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
app.get('/price', returnPrice);
app.post('/submitorder', submitOrder);
app.post('/orderdetails', returnOrderDetails);
app.post('/admin/orders', returnOrders);
app.post('/admin/groups', returnGroups);
app.delete('/admin/deleteproduct', deleteProductListing);
app.delete('/admin/deleteorder', deleteSingleOrder);
app.post('/admin/createproduct', createProductListing);

async function getRequiredGroup(productID){
  let [rows, fields] = await connection.promise().query('SELECT requiredGroup FROM products WHERE productID = ?',[productID])
  if (rows.length == 0){
    return "err"
  }
  else {
    return rows;
  }
}

async function getProductPrice(productID){
  let [rows, fields] = await connection.promise().query('SELECT price FROM products WHERE productID = ?',[productID])
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
    if (parseInt(groupSize[0].groupSize) == parseInt(requiredGroup[0].requiredGroup)) {
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

async function createProduct(productID, groupNumber, price){
  let [rows, fields, err] = await connection.promise().query('INSERT INTO products VALUES(?,?,?)',[productID, groupNumber, price])
  if (err) {
    console.log(err);
    return "err"
  }
  else {
    console.log("created product");
    return "created"
  }
}
async function deleteProduct(productID){
  let [rows, fields, err] = await connection.promise().query('DELETE FROM products WHERE productID = ?',[productID])
  if (err) {
    console.log(err);
    return "err"
  }
  else {
    console.log("deleted product");
    return "deleted"
  }
}
async function deleteOrder(orderID, userID){
  let [rows, fields, err] = await connection.promise().query('DELETE FROM orders WHERE orderID = ? AND userID = ?',[orderID, userID])
  if (err) {
    console.log(err);
    return "err"
  }
  else {
    console.log("deleted order");
    return "deleted"
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

async function returnPrice(req,res,next){
  const price = await getProductPrice(req.query.productID);
  if (price == "err") {
    res.sendStatus(400)
  }
  else {
    res.json({
      price: price[0].price
    });
  }
}

async function submitOrder(req,res,next){
  const orderID = shortid.generate();
  const googleID = await verify(req.body.token)
  if (googleID != "e" && googleID != "error") {
    connection.query('INSERT INTO orders VALUES(?,?,?,?,?,?,?)',[orderID,req.body.productID,req.body.platformID,googleID,req.body.address,Math.round((new Date()).getTime() / 1000),null],
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

async function createProductListing(req,res,next){
  const productID = req.body.productID;
  const requiredGroup = req.body.requiredGroup;
  const price = req.body.price;
  if (Number.isInteger(requiredGroup)) {
    if (requiredGroup > 1) {
      if (Number.isFinite(price)) {
        let product = await createProduct(productID,requiredGroup,price.toFixed(2))
        if (product == "err") {
          res.sendStatus(400)
        }
        else {
          res.json({
            status: "done"
          })
        }
      }
      else {
        res.json({
          status: "Price is not a valid value"
        })
      }
    }
    else {
      res.json({
        status: "Required group must be greater than 1"
      })
    }
  }
  else {
    res.json({
      status: "Required group is not an integer"
    })
  }
}

async function deleteProductListing(req, res, next){
  const productID = req.body.productID;
  let deleted = deleteProduct(productID);
  if (deleted == "err"){
    res.sendStatus(400);
  }
  else {
    res.sendStatus(200);
  }
}

async function deleteSingleOrder(req, res, next){
  const googleID = await verify(req.body.token)
  if (googleID != "e" && googleID != "error") {
    const orderID = req.body.orderID;
    let deleted = deleteOrder(orderID, googleID);
    if (deleted == "err"){
      res.sendStatus(400);
    }
    else {
      res.sendStatus(200);
    }
  }
  else {
    res.sendStatus(400)
  }
}

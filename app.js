const express = require("express");
const app = express();
var bodyParser = require('body-parser');
const uuidv1 = require('uuid/v1');
var cookieParser = require('cookie-parser');
var multer = require('multer');
var pathPackage = require('path');
var fs = require('fs');
app.use(cookieParser());
const token = {};
let userDetails = [];

//CBT:Use for Post request parameter
// var urlencodedParser = bodyParser.urlencoded({ extended: false });
//CBT:remove available images
const directory = "./public/userPhotos/";

fs.readdir(directory, (err, files) => {
  if (err) throw err;
  for (const file of files) {
    fs.unlink(pathPackage.join(directory, file), err => {
      if (err) throw err;
    });
  }
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static('public'));


//CBT:use for html response
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


function middleware(req, res, next) {
    let accessToken = "";
    if (req.body != null && req.body.accessToken != null) {
        accessToken = req.body.accessToken;
    } else if (req.query != null && req.query.accessToken != null) {
        accessToken = req.query.accessToken;
    } else if (req.cookies != null && req.cookies.accessToken != null) {
        accessToken = req.cookies.accessToken;
    }
    console.log("#############:", token);
    if (token[accessToken]) {
        console.log("Success");
        next();
    } else {
        console.log("UnSuccess");
        res.send({
            status: false
        });
    }
}

app.use("/logout", function(req, res) {
    if (req.cookies != null && req.cookies.accessToken != null) {
        accessToken = req.cookies.accessToken;
        delete token[accessToken];
        res.cookie('accessToken', "").send({
            status: true,
        });
    } else {
        res.cookie('accessToken', "").send({
            status: true,
        });
    }
})
app.use("/checkLogin", middleware, function(req, res) {
    res.send({
        status: true,
        message: "User is signed in"
    });
})
app.post("/loginUser",  function(req, res) {
    console.log(req.body.username);
    console.log(req.body.password);
    const username = req.body.username;
    const password = req.body.password;
    if (username == 'chintu' && password == 'foram') {
        const uuid = uuidv1();
        token[uuid] = true;
        res.cookie('accessToken', uuid).send({
            status: true,
            message: "login ",
            token: uuid
        });
    } else {
        res.send({
            status: false,
            message: "Invalid login "
        });
    }
});
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/userPhotos/");
    },
    filename: function (req, file, cb) {
        var d = new Date();
        var current_month = d.getMonth() + 1;
        var day = d.getDate();
        var current_year = d.getFullYear();
        var hours = d.getHours();
        var mins = d.getMinutes();
        var secs = d.getSeconds();

        var random_name = "" + current_year + current_month + day + hours + mins + secs;
        var tmp_name = random_name + "_" + file.originalname;
        cb(null, tmp_name) ;
    }
});
var upload = multer({
    storage: storage
});


app.post("/addUSerDetails", middleware,upload.single('image'),  function(req, res) {
    const name = req.body.name ;
    const city = req.body.city ;
    const sno = req.body.sno ;
    console.log("Name:", name);
    console.log("City:", city);
    console.log("sno:", sno,"\tFileName:",req.file.filename);
    if (sno != null && sno != "") {
        //CBT:update records
        updateUserDetailsById(req, res);
    } else {
        //CBT:Add records
        let uid = 1;
        if (userDetails.length > 0) {
            uid = userDetails.length + 1;
        }
        const data = {
            sno: uid,
            name: name,
            city: city,
            filename:req.file.filename
        };
        userDetails.push(data);
        res.send({
            status: true,
            message: "User details submit successfully",
            userDetails: data
        })
    }

})

app.get("/showUserList", middleware, function(req, res) {
    res.send({
        status: true,
        content: userDetails
    })
})
app.post("/removeUserDetails", middleware,  function(req, res) {
    const userIDs = req.body["userIDs[]"];
    userDetails = userDetails.filter(d => {
        return userIDs.indexOf(d.sno) == -1;
    })
    res.send({
        status: true,
        content: userDetails,
        message: "Record removed successfully"
    })
});
app.get("/getUserDetailsById", middleware, function(req, res) {
    const sno = req.query.userID;
    const data = userDetails.filter(d => {
        return d.sno == sno;
    })
    res.send({
        status: true,
        content: data
    })
})

function updateUserDetailsById(req, res) {
    const name = req.body.name;
    const city = req.body.city;
    const sno = req.body.sno;
    let findIndex = userDetails.findIndex(d => d.sno == sno);
    if (findIndex == -1) {
        res.send({
            status: false,
            message: "No records found to update"
        })
    } else {
        userDetails[findIndex].name = name;
        userDetails[findIndex].city = city;
        userDetails[findIndex].filename=req.file.filename;
        res.send({
            status: true,
            content: userDetails
        })
    }
}


// app.get("/*",middleware,)
app.use("/*",  middleware, function(req, res, next) {
    // console.log("***************", req.url, req.baseUrl, req.cookies);
    next();
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




const server = app.listen(3000, function() {
    const host = server.address().host;
    const port = server.address().port;
    console.log("Server started on ", port, (__dirname + '/public'));
});
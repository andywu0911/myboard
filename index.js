// 建立資料庫連線
const mongo=require("mongodb");
const url="mongodb+srv://root:root123@mycluster.glwg3xq.mongodb.net/?retryWrites=true&w=majority&appName=MyCluster";
const client=new mongo.MongoClient(url);
let db=null;
async function initDB(){
    await client.connect();
    console.log("資料庫連線成功");
    db=client.db("message-system");
}
initDB();
// 建立網站伺服器基礎設定
const express=require("express");
const app=express();
const session=require("express-session");
app.use(session({
    secret:"anything",
    resave:false,
    saveUninitialized:true
}));
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
// 建立需要的路由
app.get("/", async function(req, res){
    // 取得所有留言的訊息
    const collection=db.collection("message");
    let result=await collection.find({});
    let data=[];
    await result.forEach(function(message){
        data.push(message);
    });
    res.render("index.ejs", {data:data});
});
// 留言功能的路由
app.get("/send", async function(req, res){
    const name=req.query.name;
    const message=req.query.message;
    // 取得當前時間
    let date_ob = new Date();
    let year = date_ob.getFullYear();
    let month = date_ob.getMonth() + 1;
    let date = date_ob.getDate();
    let hrs = date_ob.getHours();
    let mins = date_ob.getMinutes();
    let secs = date_ob.getSeconds();
    let cur_time = year + "/" + month + "/" + date + " " + hrs + ":" + mins + ":" + secs;
    // 將新的會員資料放到資料庫
    const collection=db.collection("message");
    await collection.insertOne({
        name:name, message:message, timestamp:cur_time
    });
    // 新增成功，導回首頁
    res.redirect("/");
});
// 啟動伺服器在 http://localhost:3000/
app.listen(3000, function(){
    console.log("Server Started");
});


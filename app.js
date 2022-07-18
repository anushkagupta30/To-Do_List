const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose=require("mongoose");
const ejsLint = require('ejs-lint');
const _=require('lodash');
app.set('view engine', 'ejs');

// var items=["Buy Food","cook Food","eat Food"];
// let workItems=[];

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://admin:<password>@cluster0.erxzhiv.mongodb.net/todolistDB");// which database you need to create or connect to..here we created todolistDB

const itemsSchema=new mongoose.Schema({
  name:String
});

const Item=new mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"buy food"
})

const item2=new Item({
  name:"hey"
});

const item3=new Item({
  name:"bye"
})

const defaultItems=[item1,item2,item3];

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});

const List=new mongoose.model("List",listSchema)



app.get("/", function(req, res) {
  // var today = new Date();
  // var currentDay = today.getDay();

  var options={
    weekday:"long",
    day: "numeric",
    month:"long"
  };

  // var day=today.toDateString("en-US",options);

  Item.find({},function(err,foundItems){
    if(foundItems.length==0){
      Item.insertMany(defaultItems,function(err){
       if(err){
         console.log(err);
       }
       else console.log("successful");
     });
     res.redirect("/");
    }
    else
    res.render("list", {listTitle:"Today",newListItems:foundItems});
  });

});

app.post("/",function(req,res){

  const itemName=req.body.newItem;
  const listName=req.body.list;


  const item=new Item({
    name:itemName
  });

if(listName==="Today"){
  item.save();
   res.redirect("/");
 }
 else{
   List.findOne({name:listName},function(err,foundList){
     foundList.items.push(item);
     foundList.save();
     res.redirect("/"+listName);
   })
 }

});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("successfully deleted checked item.");
        res.redirect("/");
      }
    })
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

})

app.get("/:customListName",function(req,res){
  console.log(req.params.customListName);
  const customListName=_.capitalize(req.params.customListName);


  let promise=List.findOne({name:customListName},function(err,foundList){
    console.log(foundList+" "+err);
    if(!err)
      if(!foundList){
        const customListName=req.params.customListName;
        const list=new List({
          name:customListName,
          items:defaultItems
        });
  //      console.log(list.save());
    promise.then( list.save());
        res.redirect("/"+customListName);
      }
      else{
          res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
      }
  });
   //
})

// app.get("/work",function(req,res){
//   res.render("list", {listTitle: "Work List",newListItems:workItems});
// });
// app.post("/work",function(req,res){
//   let item=req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// });

app.listen(process.env.PORT || 3000, function() {
  console.log("server running on 3000");
});

//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();


mongoose.connect('mongodb://127.0.0.1:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true})

const itemsSchema ={
  name:String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name:"Welcome To todolist!"
});

const item2 = new Item({
  name:"Hit The + button to add a new item"
});

const item3 = new Item({
  name:" <-- hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema ={
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"))

app.set('view engine', 'ejs');

app.get("/", function (req, res) {
  
  Item.find({}).then(founditems =>{
    if(founditems.length == 0){
      Item.insertMany(defaultItems).then(m =>{
        console.log("Inserted Succesfully!")
    });
      res.redirect("/");
    }
    else{
      res.render('list', { listTitle: "Today", newListItems: founditems});
    }
  });

});

app.get("/:customListName",function(req,res){
   const customListName = _.capitalize(req.params.customListName);

   List.findOne({name:customListName}).then(foundList =>{
       if(!foundList){
        const list = new List({
          name:customListName,
         items:defaultItems
        });
        list.save();
        res.redirect("/" + customListName)
       }else{
         res.render("list",{ listTitle: foundList.name, newListItems: foundList.items});
       }
   })

});

app.post("/", function(req,res){

  const itemName = req.body.newItem
  const listName = req.body.list;
  const item= new Item({
    name:itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}).then(foundList =>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete",function(req,res){
   const checkedItemId = req.body.checkbox;
   const listName = req.body.listName;

   if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId).then(data =>{
      console.log("succesfully deleted checked item");
      res.redirect("/")
    });
   }
   else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(foundList=>{
       res.redirect("/" + listName);
    })
   }
});

app.get("/work", function(req,res){
  res.render("list",{listTitle:"Work List",newListItems:workitems});
});

app.get("/about", function(req,res){
  res.render("about");
});

app.post("/work",function(req,res){
   let item=req.body.newItem;
   workitems.push(item);
   res.redirect("/work")
});

app.listen(3000, function () {
  console.log("Server started on port 3000.");
});

var express          = require("express"),
    app              = express(), 
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    methodOverride   = require("method-override")
    expressSanitizer = require("express-sanitizer");

// APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app", {useNewUrlParser: true, useUnifiedTopology: true})
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
//express sanitizer must go after bodyparser
app.use(expressSanitizer());
//now we have told our app that whenever you get a request that has "_method" as a parameter
//take whatever it is equal to PUT/DELETE treat the request as what it's equal to 
app.use(methodOverride("_method"));
//we need to be able to serve a custom style sheet this will allow us to Semantic UI
app.use(express.static("public"));

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema ({
    title: String,
    image: String,
    body: String, 
    created: {type: Date, default: Date.now}
    //this default value
});

// SCHEMA --> MODEL
var Blog = mongoose.model("Blog", blogSchema);


// RESTFUL ROUTES 
//root route, most web pages root route(home page) takes you to the index route anyways
app.get("/", function(req, res){
    res.redirect("/blogs")
}) 
//INDEX route, GET route, /blogs lists all of the blogs
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, allBlogs){
        if(err){
            console.log(err)
        }else{
            res.render("index", {blogs: allBlogs})
        }
    });
});

//NEW route, GET route, /blogs/new shows the form to create a new blog
app.get("/blogs/new", function(req, res){
    res.render("new")
})

//CREATE route, POST route, /blogs add new 
app.post("/blogs", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body)
    //req.body is whatever is coming from form, and blog.body is the "name" attr
    //req.body.blog automatically grabs title, image, and body
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            console.log(err)
        } else{
            res.redirect("/blogs")
        }
    });
});

//SHOW route, GET route, /blogs:id this will show more info on specific blog
app.get("/blogs/:id", function(req, res){
    //now we have to render the info about the blog corresponding to specific blog id
    //because we got the button to link to id, now just when we show it we want to show the id info
    //req.params.id refers to the :id in the url which is rendered in the index.ejs 
    //by pulling the id from mongo and linking it to the button
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            console.log(err)
        } else{
            res.render("show", {blog: foundBlog})
        }
    })
})

//EDIT route, GET route, /blogs/:id/edit show an edit form for specific blog
app.get("/blogs/:id/edit", function(req, res){
    //in order to edit we have to display the blog
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            console.log(err)
        } else{
            res.render("edit", {blog: foundBlog})
        }
    })
})

//UPDATE route, PUT route, /blogs/:id updates a specific blog then redirects somewhere
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body)
    //take the id in the url req.params.id
    //find that blog post 
    //update with the new data req.body.blog (what we called it in the edit.ejs)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            console.log(err)
        } else{
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

//DETROY route, DELETE route, /blogs/:id delete a specfic blog
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndDelete(req.params.id, function(err){
        if(err){
            console.log(err)
        } else{
            res.redirect("/blogs")
        }
    });
});


app.listen(3000, function(){
    console.log("Blog app Server is listening!")
});


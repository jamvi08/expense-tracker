const express = require("express");
const cors = require("cors");  // import cors
const env = require("dotenv");
const mongoose = require("mongoose");
env.config();

const app = express();
app.use(express.json());
app.use(cors());
mongoose.connect("mongodb+srv://jam:stfu@accha.0qjc52q.mongodb.net/");

const products = mongoose.model("products",{item:String, price:Number})


app.post('/item-post',async function(req,res){
    const item = req.body.item;
    const price = req.body.price;
    console.log(item);
    console.log(price);
    
    const naveen = new products({
        item: item,
        price: price

    })
    await naveen.save();

    res.send(
        "yes"
    );

})

app.get('/item-get', async function(req,res){
    try {
        const allProducts = await products.find({});
        res.json(allProducts);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to retrieve products" });
    }
})

app.delete('/item-del', async function(req,res){
    try {
        const { id } = req.body;
        
        if (!id) {
            return res.status(400).json({ error: "Product ID is required" });
        }
        
        const deletedProduct = await products.findByIdAndDelete(id);
        
        if (!deletedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        res.json({ message: "Product deleted successfully", deletedProduct });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Failed to delete product" });
    }
})

app.listen(3000,function(){
    console.log("done");
})

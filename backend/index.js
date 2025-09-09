const express = require("express");
const cors = require("cors");  
const env = require("dotenv");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
env.config({ path: path.join(__dirname, '.env') });

console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');

const app = express();
app.use(express.json());
app.use(cors());
mongoose.connect(process.env.MONGODB_URI);


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


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
        console.log(allProducts)
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


app.post('/gemini', async function(req, res) {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ response: text });
    } catch (error) {
        console.error("Error with Gemini API:", error);
        res.status(500).json({ error: "Failed to generate response" });
    }
});

app.listen(3000,function(){
    console.log("done");
    
})

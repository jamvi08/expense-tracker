"use client"
import Btn from "../components/ui/Btn";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {

  const [products, setProducts] = useState([]);
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  
  useEffect(() => {

    const fetchData = async () => {
      await getData();
    }
    fetchData();
  },[]);

  const addProduct = async ()=>{
    if(!item || !price) return;

    await postData();
    await getData(); // Refresh the product list from database
    setItem("");
    setPrice("");
  }

  const postData = async ()=>{
    const res= await fetch("http://localhost:3000/item-post",{
      method: 'POST',
      headers : {'Content-Type':'application/json'},
      body : JSON.stringify({item,price})
    }

    )
  }

  const getData = async () =>{
    try {
      const response = await fetch("http://localhost:3000/item-get");
      
      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const text = await response.text();
        console.error("Server returned an error:", text);
        return;
      }
      
      const data = await response.json();
      console.log("Products from server:", data); // Debug log
      
      setProducts(data.map(item => ({ 
        name: item.item, 
        price: item.price, 
        id: item._id // MongoDB uses _id for document IDs
      })));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  const delData = async (id) =>{
    try {
      console.log("Deleting product with ID:", id); // Debug log
      
      const response = await fetch("http://localhost:3000/item-del", {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id })
      });
      
      if (response.ok) {
        console.log("Product deleted successfully");
        // Refresh the product list after successful deletion
        await getData();
      } else {
        // Get the response text first
        const responseText = await response.text();
        console.error("Error deleting product, status:", response.status);
        
        // Then try to parse it as JSON if possible
        try {
          const errorData = JSON.parse(responseText);
          console.error("Error details:", errorData.error || errorData);
        } catch (parseError) {
          console.error("Server response (not JSON):", responseText);
        }
      }
    } catch (error) {
      console.error("Error making delete request:", error);
    }
  }
  
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Item</label>
          <input 
            type="text" 
            value={item} 
            onChange={(e) => setItem(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md" 
            placeholder="Please put items"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input 
            type="number" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md" 
            placeholder="Drop price"
          />
        </div>
        <Btn text="Add Product" fn={addProduct} />
        
        <div>
          <label className="block text-sm font-medium mb-1">Products</label>
          <ul className="border border-gray-300 rounded-md divide-y">
            {products.map((product, index) => (
              <li key={index} className="px-3 py-2 flex justify-between items-center">
                <span>{product.name}</span>
                <div className="flex items-center gap-3">
                  <span>Rs.{product.price}</span>
                  <button 
                    onClick={() => delData(product.id)} 
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Total</label>
          <input 
            type="number" 
            readOnly 
            value={products.reduce((total, product) => total + product.price, 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" 
            placeholder="Here's your total"
          />
        </div>
      </div>
    </div>
  );
}

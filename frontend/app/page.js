"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Trash2, MessageCircle, X, Send, RotateCcw } from "lucide-react"
import gemini from "@/utils/gemini"

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([])
  const [productName, setProductName] = useState("")
  const [productPrice, setProductPrice] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState("")
  const [isAiTyping, setIsAiTyping] = useState(false)
  const chatMessagesEndRef = useRef(null)

  
  const API_BASE = "http://localhost:3000"
  
  

  
  useEffect(() => {
    fetchExpenses()
  }, [])

  
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages, isAiTyping])

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_BASE}/item-get`)
      const data = await response.json()
      const formattedExpenses = data.map(item => ({
        id: item._id,
        productName: item.item,
        productPrice: item.price
      }))
      setExpenses(formattedExpenses)
    } catch (error) {
      console.error("Error fetching expenses:", error)
    }
  }

  const addExpense = async () => {
    if (productName.trim() && productPrice.trim()) {
      try {
        const response = await fetch(`${API_BASE}/item-post`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            item: productName.trim(),
            price: Number.parseFloat(productPrice)
          })
        })
        
        if (response.ok) {
     
          await fetchExpenses()
          setProductName("")
          setProductPrice("")
        }
      } catch (error) {
        console.error("Error adding expense:", error)
      }
    }
  }

  const deleteExpense = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/item-del`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      })
      
      if (response.ok) {
 
        await fetchExpenses()
      }
    } catch (error) {
      console.error("Error deleting expense:", error)
    }
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.productPrice, 0)

  const sendChatMessage = async () => {
    if (chatInput.trim()) {
      const userMessage = { id: Date.now(), text: chatInput, sender: "user" }
      setChatMessages([...chatMessages, userMessage])
      setChatInput("")
      setIsAiTyping(true)

     
      const expenseContext = `I'm using an expense tracker app. My current expenses are: ${expenses.map(e => `${e.productName}: Rs${e.productPrice}`).join(', ')}. Total: Rs${totalAmount.toFixed(2)}. User question: ${chatInput}`

      try {
     
        const botResponse = await gemini(expenseContext)
        const botMessage = { id: Date.now() + 1, text: botResponse, sender: "bot" }
        setChatMessages((prev) => [...prev, botMessage])
      } catch (error) {
        console.error("Error getting AI response:", error)
       
        const fallbackResponse = "Sorry, I'm having trouble connecting right now. Please try again later."
        const botMessage = { id: Date.now() + 1, text: fallbackResponse, sender: "bot" }
        setChatMessages((prev) => [...prev, botMessage])
      } finally {
        setIsAiTyping(false)
      }
    }
  }

  const clearChat = () => {
    setChatMessages([])
    setIsAiTyping(false)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Expense Tracker</h1>
          <p className="text-muted-foreground">Track your daily expenses with ease</p>
        </div>

        {/* Add Expense Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Add New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName" className="text-foreground font-medium">
                  Product Name
                </Label>
                <Input
                  id="productName"
                  type="text"
                  placeholder="Enter product name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productPrice" className="text-foreground font-medium">
                  Product Price (Rs)
                </Label>
                <Input
                  id="productPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addExpense} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Add Expense
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Amount */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-2">Total Expenses</p>
              <p className="text-4xl font-bold text-primary">Rs{totalAmount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Expenses List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Your Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-lg">No expenses added yet</p>
                <p className="text-muted-foreground">Start by adding your first expense above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 bg-card border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground text-lg">{expense.productName}</h3>
                      <p className="text-primary font-bold text-xl">Rs{expense.productPrice.toFixed(2)}</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deleteExpense(expense.id)} className="ml-4">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Chatbot Button */}
      <Button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chatbot Popup */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md h-[500px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
              <CardTitle className="text-lg text-primary">Expense Assistant</CardTitle>
              <div className="flex gap-2">
                {chatMessages.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearChat} title="Clear Chat">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)} title="Close Chat">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 scroll-smooth">
                {chatMessages.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    <p>Start a conversation with your AI expense assistant!</p>
                  </div>
                ) : (
                  <>
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`p-3 rounded-lg max-w-[85%] break-words ${
                            message.sender === "user"
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-white text-gray-800 shadow-sm border rounded-bl-sm"
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    ))}
                    {isAiTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white text-gray-800 shadow-sm border rounded-lg rounded-bl-sm p-3 max-w-[85%]">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={chatMessagesEndRef} />
              </div>
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask me anything..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendChatMessage} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
    </div>
  )
}

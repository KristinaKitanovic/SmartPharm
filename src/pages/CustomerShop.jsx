import { GoogleGenerativeAI } from "@google/generative-ai";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import LogoImage from "../assets/images/pharmacylogo.png";
import CartImage from "../assets/images/cart.png";
import "../styles/CustomerShop.scss";
import "../styles/global.scss";

export function CustomerShop() {
  const navigate = useNavigate();

  const [showChatbot, setShowChatbot] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [searchboxInput, setSearchboxInput] = useState("");
  const [showPharmacystChat, setShowPharmacystChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [productForCart, setProductForCart] = useState({
    label: "",
    userid: "",
    quantity: 1,
    productid: "",
  });

  const chatSessionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const pharmacystChatEndRef = useRef(null);

  const systemPrompt = `
    Your name is Smarty. You are a friendly,cute and professional virtual assistant working for "SmartPharm", a modern online pharmacy that offers medications and expert pharmaceutical advice.
    You must introduce yourself even before someone sent any message. So at the top of the chat you will introduce yourself.

    You are now also aware of new medications and their details:
    Paracetamol: Used for pain relief and fever reduction. It is commonly used to treat headaches, muscle aches, back pain, and mild arthritis.
    Brufen (Ibuprofen): A nonsteroidal anti-inflammatory drug (NSAID) used to reduce fever, pain, and inflammation. It is often used for conditions like headaches, dental pain, menstrual cramps, and minor injuries.

    If you are not sure about something:
    Respond with this exact message:
    "Sorry, I can't answer that question right now, but your question has been passed to our team and we’re working on improving Smarty. Thank you for your patience!"

    Do not make up an answer or guess.
    Your job is to:
    - Help users find the right medicine for their symptoms.
    - Explain what the medicine is used for and how it works.
    - Respond clearly, politely, and professionally – like a real pharmacist.

    Only mention licensing if you really don't know the answer. 

    The founder of SmartPharm is Kristina Kitanovic. She is second year software engineering student.

    If someone asks how they can order medication, tell them to click the "Add to Cart" button beneath all products.

    If someone asks how to get a discount code, tell them they need to visit SmartPharm in person and provide their phone number. A pharmacist will then give them the discount code.
    `;

  const startChatSession = async () => {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chat = model.startChat({
      history: [],
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }],
      },
    });

    chatSessionRef.current = chat;

    const result = await chat.sendMessage("");
    const response = result.response.text();
    setChatHistory([{ type: "bot", message: response }]);
  };

  useEffect(() => {
    startChatSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [chatHistory]);

  useEffect(() => {
    const fetchProducts = async () => {
      const controller = new AbortController();
      try {
        const response = await fetch("http://localhost:5000/product", {
          signal: controller.signal,
        });
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      }

      return () => controller.abort();
    };
    fetchProducts();
  }, []);

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    setLoading(true);

    try {
      const chat = chatSessionRef.current;
      const result = await chat.sendMessage(userInput);
      const response = result.response.text();

      setChatHistory([
        ...chatHistory,
        { type: "user", message: userInput },
        { type: "bot", message: response },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
      setUserInput("");
    }
  };

  const clearChat = async () => {
    setChatHistory([]);
    await startChatSession();
  };

  const changeCategory = (type) => {
    setCategory(type);
  };

  useEffect(() => {
    setFilteredProducts(
      category === "all"
        ? products
        : products.filter((el) => el.type === category),
    );
  }, [category, products]);

  const searchForProducts = (e) => {
    setSearchboxInput(e.target.value.toLowerCase());
    setFilteredProducts(
      e.target.value === ""
        ? products
        : products.filter((el) =>
            el.label.toLowerCase().includes(e.target.value),
          ),
    );
  };

  const sendMessageToPharmacyst = async () => {
    if (newMessage.trim() === "") return;

    const messageToSend = {
      userid: sessionStorage.getItem("UserId"),
      messagetext: newMessage,
      customerid: sessionStorage.getItem("UserId"),
      time: new Date().toISOString(),
    };
    try {
      let response = await fetch("http://localhost:5000/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageToSend),
      });
      if (!response.ok) {
        throw new Error("Could not send a message.");
      }
      const userMessageSummaryRes = await fetch(
        `http://localhost:5000/usermessagesummary?userid=${sessionStorage.getItem("UserId")}`,
      );
      const userMessageSummaryArr = await userMessageSummaryRes.json();
      const userMessageSummary = userMessageSummaryArr[0];
      response = await fetch(
        `http://localhost:5000/usermessagesummary/${userMessageSummary.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unreadcount: Number(userMessageSummary.unreadcount) + 1,
            lastmessagetime: messageToSend.time,
          }),
        },
      );
      if (!response.ok) {
        throw new Error("Could not update message summary");
      }
      setMessages((current) => [...current, messageToSend]);
    } catch (err) {
      console.error(err);
    } finally {
      setNewMessage("");
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("http://localhost:5000/message");
        let data = await response.json();
        data = data.filter(
          (el) => el.customerid === sessionStorage.getItem("UserId"),
        );
        const sortedMessages = data.sort((a, b) => {
          const timeA = new Date(a.lastmessagetime).getTime();
          const timeB = new Date(b.lastmessagetime).getTime();
          return timeA - timeB;
        });
        setMessages(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchMessages();
  }, []);

  const openPopup = (el) => {
    setProductForCart((current) => ({
      ...current,
      label: el.label,
      productid: el.id,
      userid: sessionStorage.getItem("UserId"),
    }));
    setShowPopup(true);
  };

  const addToCart = async () => {
    try {
      let response = await fetch(
        `http://localhost:5000/cart?productid=${productForCart.productid}&userid=${productForCart.userid}`,
      );
      const dataRes = await response.json();
      const data = dataRes[0];
      if (!data) {
        response = await fetch("http://localhost:5000/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productForCart),
        });
      } else {
        response = await fetch(`http://localhost:5000/cart/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quantity: Number(data.quantity) + Number(productForCart.quantity),
          }),
        });
      }

      if (!response.ok) {
        throw new Error("Could not add product to cart.");
      }

      const userCartRes = await fetch(
        `http://localhost:5000/usercart?userid=${sessionStorage.getItem("UserId")}`,
      );
      const userCartArray = await userCartRes.json();
      const userCart = userCartArray[0];
      const productRes = await fetch(
        `http://localhost:5000/product/${productForCart.productid}`,
      );
      const product = await productRes.json();
      const totalCost =
        Number(userCart.originalprice) +
        Number(product.price) * Number(productForCart.quantity);

      const updateResponse = await fetch(
        `http://localhost:5000/usercart/${userCart.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalprice: parseFloat(totalCost).toFixed(2),
            totalprice: parseFloat(totalCost).toFixed(2),
          }),
        },
      );
      if (!updateResponse.ok) {
        throw new Error("Could not add price to the total price of your cart.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProductForCart({
        label: "",
        userid: "",
        productid: "",
        quantity: 1,
      });
      setShowPopup(false);
    }
  };

  useEffect(() => {
    pharmacystChatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  return (
    <>
      <div className="header">
        <p className="SPLabel">SMARTPHARM</p>
        <input
          className="searchbox"
          type="text"
          value={searchboxInput}
          onChange={(e) => {
            searchForProducts(e);
          }}
          placeholder="Search for products..."
        />
        <a className="cart" onClick={() => navigate("/Cart")}>
          <img src={CartImage} />
        </a>
      </div>
      <div className="sidebar">
        <div className="logoContainer">
          <img src={LogoImage} />
        </div>
        <button
          className="chatwithpharmacystButton"
          onClick={() => setShowPharmacystChat(true)}
        >
          Chat With Pharmacyst
        </button>
        <div className="categorization">
          <p>Categories</p>
          <div className="categories">
            <a href="#" onClick={() => changeCategory("all")}>
              All Products
            </a>
            <a href="#" onClick={() => changeCategory("depression")}>
              Antidepressants
            </a>
            <a href="#" onClick={() => changeCategory("pain")}>
              Pain Relief
            </a>
            <a href="#" onClick={() => changeCategory("head")}>
              Headache & Migraine
            </a>
            <a href="#" onClick={() => changeCategory("cold")}>
              Cold & Flu
            </a>
            <a href="#" onClick={() => changeCategory("digestive")}>
              Digestive Health
            </a>
            <a href="#" onClick={() => changeCategory("allergy")}>
              Allergy Relief{" "}
            </a>
            <a href="#" onClick={() => changeCategory("skin")}>
              {" "}
              Skin Care
            </a>
            <a href="#" onClick={() => changeCategory("diabetes")}>
              Diabetes Care
            </a>
            <a href="#" onClick={() => changeCategory("heart")}>
              Heart Health
            </a>
            <a href="#" onClick={() => changeCategory("vitamins")}>
              Vitamins & Supplements
            </a>
          </div>
        </div>
      </div>

      {!showChatbot && (
        <button className="chatbotButton" onClick={() => setShowChatbot(true)}>
          Have Any Questions? Ask SmartPharm ChatBot Anything!
        </button>
      )}

      {showChatbot && (
        <div className="chatbot">
          <div className="chatbotHeader">
            <p>SmartPharm Chatbot</p>
            <button onClick={() => setShowChatbot(false)}>X</button>
          </div>
          <div className="chatbotMessages">
            {chatHistory.map((el, index) => (
              <ReactMarkdown
                key={index}
                components={{
                  p: ({ node, ...props }) => (
                    <p
                      {...props}
                      className={
                        el.type === "user" ? "userMessage" : "botMessage"
                      }
                    />
                  ),
                }}
              >
                {el.message}
              </ReactMarkdown>
            ))}
            <div ref={messagesEndRef}></div>
          </div>
          <div className="chatbotInput">
            <input
              type="text"
              placeholder="Ask SmartPharm ChatBot..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button onClick={sendMessage} disabled={loading}>
              Send
            </button>
            <button onClick={clearChat}>Clear Chat</button>
          </div>
        </div>
      )}
      <div className="productsGrid">
        {filteredProducts.map((el, index) => (
          <div key={index} className="item">
            <div className="pictureContainer">
              <img src={el.image} />
            </div>
            <div className="labelandprice">
              <div className="label">{el.label}</div>
              <div className="price">{el.price}$</div>
            </div>
            <div className="description">{el.description}</div>
            <button
              className="addtocartButton"
              onClick={() => {
                openPopup(el);
              }}
            >
              Add To Cart
            </button>
          </div>
        ))}
      </div>
      {showPharmacystChat && (
        <div className="pharmacystChat">
          <div className="pharmacystChatHeader">
            <p>Chat With Pharmacyst</p>
            <button onClick={() => setShowPharmacystChat(false)}>X</button>
          </div>
          <div className="pharmacystChatMessages">
            {messages.map((el, index) => (
              <div
                key={index}
                className={
                  el.customerid === el.userid
                    ? "userMessage"
                    : "pharmacystMessage"
                }
              >
                {el.messagetext}
              </div>
            ))}
            <div ref={pharmacystChatEndRef}></div>
          </div>
          <div className="pharmacystChatInput">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button
              onClick={() => sendMessageToPharmacyst()}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessageToPharmacyst();
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
      {showPopup && (
        <div className="popup">
          <div className="productQuantity">
            Enter Quantity for {productForCart.label}:
          </div>
          <input
            type="number"
            min="1"
            value={productForCart.quantity}
            onChange={(e) =>
              setProductForCart((current) => ({
                ...current,
                quantity: Number(e.target.value),
              }))
            }
            required
          />
          <div className="popupButtons">
            <button
              onClick={() => {
                addToCart();
              }}
            >
              Confirm
            </button>
            <button onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}

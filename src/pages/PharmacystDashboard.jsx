import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "../styles/Dashboard.scss";

export function PharmacystDashboard() {
  const [products, setProducts] = useState([]);
  const [chats, setChats] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [chosenChat, setChosenChat] = useState({});
  const [showEditWindow, setShowEditWindow] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [discountCode, setDiscountCode] = useState({
    code: "",
    percentage: "",
  });
  const [productEdit, setProductEdit] = useState({});
  const [productAdd, setProductAdd] = useState({
    label: "",
    quantity: 0,
    type: "",
    description: "",
    price: 0,
    image: "/productimages/mockMedicine.png",
    expirationdate: "",
    needsreceipt: false,
  });

  const MessagesEndRef = useRef(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/product");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!showChat) {
      const fetchChats = async () => {
        try {
          const response = await fetch(
            "http://localhost:5000/usermessagesummary",
          );
          const data = await response.json();
          const sortedChats = data.sort((a, b) => {
            const timeA = new Date(a.lastmessagetime).getTime();
            const timeB = new Date(b.lastmessagetime).getTime();
            return timeB - timeA;
          });
          setChats(sortedChats);
        } catch (err) {
          console.error(err);
        }
      };
      fetchChats();
    }
  }, [showChat]);

  const deleteProduct = async (el) => {
    try {
      const response = await fetch(`http://localhost:5000/product/${el.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Could not delete product");
      }
      await fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const openChat = async (el) => {
    setShowChat(true);
    setChosenChat(el);

    try {
      let response = await fetch(
        `http://localhost:5000/message?customerid=${el.userid}`,
      );
      const data = await response.json();
      const sortedMessages = data.sort((a, b) => {
        const timeA = new Date(a.lastmessagetime).getTime();
        const timeB = new Date(b.lastmessagetime).getTime();
        return timeA - timeB;
      });
      setChatMessages(sortedMessages);
      response = await fetch(
        `http://localhost:5000/usermessagesummary/${el.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ unreadcount: 0 }),
        },
      );
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (messageInput.trim() === "") return;
    try {
      let response = await fetch("http://localhost:5000/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userid: sessionStorage.getItem("UserId"),
          messagetext: messageInput,
          customerid: chosenChat.userid,
          time: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        throw new Error("Could not send the message.");
      }
      response = await fetch(
        `http://localhost:5000/usermessagesummary/${chosenChat.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lastmessagetime: new Date().toISOString() }),
        },
      );
      if (!response.ok) {
        throw new Error("Could not update message summary");
      }
      openChat(chosenChat);
    } catch (err) {
      console.error(err);
    } finally {
      setMessageInput("");
    }
  };

  useEffect(() => {
    MessagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [chatMessages]);

  const generateDC = () => {
    let allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let newCode = "";

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * allowedChars.length);
      newCode += allowedChars[randomIndex];
    }
    setDiscountCode((current) => ({ ...current, code: newCode }));
  };

  const AddDiscountCode = async () => {
    try {
      const response = await fetch("http://localhost:5000/discountcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discountCode),
      });
      if (!response.ok) {
        throw new Error("Could not add new discount code");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDiscountCode({
        code: "",
        percentage: "",
      });
    }
  };

  const addProduct = async () => {
    try {
      const response = await fetch("http://localhost:5000/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productAdd),
      });
      if (!response.ok) {
        throw new Error("Could not add new product");
      }
      await fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setProductAdd({
        label: "",
        quantity: 0,
        type: "",
        description: "",
        price: 0,
        image: "/productimages/mockMedicine.png",
        expirationdate: "",
        needsreceipt: false,
      });
      setSelectedFile(null);
    }
  };

  const setEditWindow = (el) => {
    setShowEditWindow(true);
    setProductEdit(el);
  };

  const editProduct = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/product/${productEdit.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productEdit),
        },
      );
      if (!response.ok) {
        throw new Error("Coult not edit the product");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setShowEditWindow(false);
      await fetchProducts();
      setProductAdd({
        label: "",
        quantity: 0,
        type: "",
        description: "",
        price: 0,
        image: "/productimages/mockMedicine.png",
        expirationdate: "",
        needsreceipt: false,
      });
    }
  };

  return (
    <>
      <div className="containerDash">
        {!showChat && (
          <div className="chatList">
            {chats.map((el, index) => (
              <a
                key={index}
                className="chat"
                onClick={() => {
                  openChat(el);
                }}
              >
                <p className="chatname">{el.username}</p>
                <p className="unread">{el.unreadcount} unread</p>
                <p className="chatTime">
                  {new Date(el.lastmessagetime)
                    .toLocaleString()
                    .split(",")
                    .slice(0, 2)
                    .join(" ")}
                </p>
              </a>
            ))}
          </div>
        )}

        {showChat && (
          <div className="pharmacystChatDashboard">
            <div className="pharmacystChatHeader">
              <p>Chat With Pharmacyst</p>
              <button onClick={() => setShowChat(false)}>X</button>
            </div>
            <div className="pharmacystChatMessages">
              {chatMessages.map((el, index) => (
                <div
                  key={index}
                  className={
                    el.customerid === el.userid
                      ? "userMessageDashboard"
                      : "pharmacystMessageDashboard"
                  }
                >
                  {el.messagetext}
                </div>
              ))}
              <div ref={MessagesEndRef}></div>
            </div>
            <div className="pharmacystChatInput">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
              />
              <button
                onClick={() => {
                  sendMessage();
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}

        <div className="discountContainer">
          <input type="text" value={discountCode.code} readOnly />
          <button
            onClick={() => {
              generateDC();
            }}
          >
            Generate Discount Code
          </button>
          <p>Enter Discount %:</p>
          <input
            type="number"
            value={discountCode.percentage}
            onChange={(e) =>
              setDiscountCode((current) => ({
                ...current,
                percentage: Number(e.target.value),
              }))
            }
            required
          />
          <button onClick={() => AddDiscountCode()}>Save Discount Code</button>
        </div>

        {!showEditWindow && (
          <div className="addWindow">
            <p>Add Product</p>
            <div className="Inputs">
              <div className="left">
                <p>Label</p>
                <input
                  type="text"
                  placeholder="Enter Label"
                  value={productAdd.label}
                  onChange={(e) =>
                    setProductAdd((current) => ({
                      ...current,
                      label: e.target.value,
                    }))
                  }
                  required
                />
                <p>Quantity</p>
                <input
                  type="number"
                  placeholder="Enter Quantity"
                  value={productAdd.quantity}
                  onChange={(e) =>
                    setProductAdd((current) => ({
                      ...current,
                      quantity: Number(e.target.value),
                    }))
                  }
                  required
                />
                <p>Type</p>
                <select
                  value={productAdd.type}
                  onChange={(e) =>
                    setProductAdd((current) => ({
                      ...current,
                      type: e.target.value,
                    }))
                  }
                  required
                >
                  <option disabled value="">
                    Choose type
                  </option>
                  <option value="depression">Depression</option>
                  <option value="pain">Pain</option>
                  <option value="head">Head</option>
                  <option value="cold">Cold</option>
                  <option value="digestion">Digestion</option>
                  <option value="allergy">Allergy</option>
                  <option value="skin">Skin</option>
                  <option value="diabetes">Diabetes</option>
                  <option value="heart">Heart</option>
                  <option value="vitamins">Vitamins</option>
                </select>
                <p>Description</p>
                <input
                  type="text"
                  placeholder="Enter Description"
                  value={productAdd.description}
                  onChange={(e) =>
                    setProductAdd((current) => ({
                      ...current,
                      description: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="right">
                <p>Price</p>
                <input
                  type="number"
                  placeholder="Enter Price"
                  value={productAdd.price}
                  onChange={(e) =>
                    setProductAdd((current) => ({
                      ...current,
                      price: Number(e.target.value),
                    }))
                  }
                  required
                />
                <p>Image</p>
                <input
                  type="file"
                  accept="image/png"
                  placeholder="Enter Image"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required
                />
                <p>Expiration Date</p>
                <input
                  type="date"
                  value={productAdd.expirationdate}
                  onChange={(e) =>
                    setProductAdd((current) => ({
                      ...current,
                      expirationdate: e.target.value,
                    }))
                  }
                  placeholder="Enter Expiration Date"
                  required
                />
                <p>Needs Receipt?</p>
                <select
                  value={productAdd.needsreceipt ? "Yes" : "No"}
                  onChange={(e) =>
                    setProductAdd((current) => ({
                      ...current,
                      needsreceipt: e.target.value === "Yes",
                    }))
                  }
                  required
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                addProduct();
              }}
            >
              Add Product
            </button>
          </div>
        )}
        {showEditWindow && (
          <div className="editWindow">
            <p>Edit Product</p>
            <div className="Inputs">
              <div className="left">
                <p>Label</p>
                <input
                  type="text"
                  placeholder="Enter Label"
                  value={productEdit.label}
                  onChange={(e) =>
                    setProductEdit((current) => ({
                      ...current,
                      label: e.target.value,
                    }))
                  }
                  required
                />
                <p>Quantity</p>
                <input
                  type="number"
                  placeholder="Enter Quantity"
                  value={productEdit.quantity}
                  onChange={(e) =>
                    setProductEdit((current) => ({
                      ...current,
                      quantity: Number(e.target.value),
                    }))
                  }
                  required
                />
                <p>Type</p>
                <select
                  value={productEdit.type}
                  onChange={(e) =>
                    setProductEdit((current) => ({
                      ...current,
                      type: e.target.value,
                    }))
                  }
                  required
                >
                  <option disabled selected>
                    Choose type
                  </option>
                  <option>Depression</option>
                  <option>Pain</option>
                  <option>Head</option>
                  <option>Cold</option>
                  <option>Digestion</option>
                  <option>Allergy</option>
                  <option>Skin</option>
                  <option>Diabetes</option>
                  <option>Heart</option>
                  <option>Vitamins</option>
                </select>
                <p>Description</p>
                <input
                  type="text"
                  placeholder="Enter Description"
                  value={productEdit.description}
                  onChange={(e) =>
                    setProductEdit((current) => ({
                      ...current,
                      description: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="right">
                <p>Price</p>
                <input
                  type="number"
                  placeholder="Enter Price"
                  value={productEdit.price}
                  onChange={(e) =>
                    setProductEdit((current) => ({
                      ...current,
                      price: Number(e.target.value),
                    }))
                  }
                  required
                />
                <p>Image</p>
                <input
                  type="file"
                  accept="image/png"
                  placeholder="Enter Image"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required
                />
                <p>Expiration Date</p>
                <input
                  type="date"
                  placeholder="Enter Expiration Date"
                  value={productEdit.expirationdate}
                  onChange={(e) =>
                    setProductEdit((current) => ({
                      ...current,
                      expirationdate: e.target.value,
                    }))
                  }
                  required
                />
                <p>Needs Receipt?</p>
                <select
                  value={productEdit.needsreceipt ? "Yes" : "No"}
                  onChange={(e) =>
                    setProductEdit((current) => ({
                      ...current,
                      needsreceipt: e.target.value === "Yes",
                    }))
                  }
                  required
                >
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                editProduct();
              }}
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>ProductId</th>
            <th>Label</th>
            <th>Price</th>
            <th>Description</th>
            <th>Type</th>
            <th>ImagePath</th>
            <th>Expiration Date</th>
            <th>Quantity</th>
            <th>Manage Table</th>
          </tr>
        </thead>
        <tbody>
          {products.map((el, index) => (
            <tr className="row">
              <td>{el.id}</td>
              <td>{el.label}</td>
              <td>{el.price}</td>
              <td>{el.description}</td>
              <td>{el.type}</td>
              <td>{el.image}</td>
              <td>{el.expirationdate}</td>
              <td>{el.quantity}</td>
              <td>
                <button
                  onClick={() => {
                    setEditWindow(el);
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    deleteProduct(el);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

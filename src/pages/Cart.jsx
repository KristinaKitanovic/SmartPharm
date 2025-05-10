import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import "../styles/Cart.scss";

export function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [userCart, setUserCart] = useState({});
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [showInvalidMessage, setShowInvalidMessage] = useState(false);
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [cameraOpened, setCameraOpened] = useState(false);
  const webRef = useRef(null);
  const [cameraItem, setCameraItem] = useState({});
  const [showReceipt, setShowReceipt] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    city: "",
    address: "",
    phone: "",
  });

  const fetchCartItems = async () => {
    try {
      const response = await fetch("http://localhost:5000/cart");
      let data = await response.json();
      data = data.filter(
        (el) => el.userid === sessionStorage.getItem("UserId"),
      );
      let dataWithProduct = await Promise.all(
        data.map(async (item) => {
          const productRes = await fetch(
            `http://localhost:5000/product/${item.productid}`,
          );
          const product = await productRes.json();
          return { ...item, product };
        }),
      );
      dataWithProduct = dataWithProduct.map((el) => {
        let stockStatus = "OK";
        if (el.product.quantity === 0) {
          stockStatus = "OUT OF STOCK";
        } else if (el.product.quantity < el.quantity) {
          stockStatus = "NOT ENOUGH STOCK";
        }
        return { ...el, stockStatus, receiptadded: false, img: null };
      });
      setCartItems(dataWithProduct);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchUserCart = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/usercart?userid=${sessionStorage.getItem("UserId")}`,
      );
      const data = await response.json();
      setUserCart(data[0]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCartItems();
    fetchUserCart();
  }, []);

  const removeFromCart = async (el) => {
    try {
      let response = await fetch(`http://localhost:5000/cart/${el.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Could not delete cart item");
      }
      response = await fetch(`http://localhost:5000/usercart/${userCart.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalprice: parseFloat(
            Number(userCart.originalprice) -
              Number(el.product.price * el.quantity),
          ).toFixed(2),
          originalprice: parseFloat(
            Number(userCart.originalprice) -
              Number(el.product.price * el.quantity),
          ).toFixed(2),
        }),
      });
      await fetchCartItems();
      await fetchUserCart();
    } catch (err) {
      console.error(err);
    }
  };

  const applyDiscount = async () => {
    try {
      let response = await fetch(
        `http://localhost:5000/discountcode?code=${discountCodeInput}`,
      );
      const dataRes = await response.json();
      const data = dataRes[0];
      if (data) {
        response = await fetch(
          `http://localhost:5000/usercart/${userCart.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              totalprice: (
                (userCart.originalprice * (100.0 - Number(data.percentage))) /
                100
              ).toFixed(2),
            }),
          },
        );
        await fetchUserCart();
        setShowInvalidMessage(false);
      } else {
        setShowInvalidMessage(true);
      }
    } catch (err) {
      console.error("Could not apply discount");
    } finally {
      setDiscountCodeInput("");
    }
  };

  const order = async () => {
    try {
      // Fetch user info
      let response = await fetch(
        `http://localhost:5000/user/${sessionStorage.getItem("UserId")}`,
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error("Could not fetch user information");
      }

      // Send email to customer
      await fetch("http://localhost:3000/send-email-to-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const minimizedCartItems = cartItems.map(({ img, ...rest }) => rest);
      // Send email to company
      await fetch("http://localhost:3000/send-email-to-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: data,
          userCart,
          cartItems: minimizedCartItems,
          details: checkoutData,
        }),
      });

      // Update product quantity and remove cart items
      for (let el of cartItems) {
        let response = await fetch(
          `http://localhost:5000/product/${el.productid}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quantity: Number(el.product.quantity) - Number(el.quantity),
            }),
          },
        );
        if (!response.ok) {
          throw new Error("Could not update product quantity");
        }
        response = await fetch(`http://localhost:5000/cart/${el.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Could not remove cart item");
        }
      }

      // Set total price and original price to zero
      response = await fetch(`http://localhost:5000/usercart/${userCart.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalprice: 0, totalprice: 0 }),
      });
      if (!response.ok) {
        throw new Error("Could not update user cart");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setShowCheckoutPopup(false);
      await fetchCartItems();
      await fetchUserCart();
    }
  };

  const openCamera = (el) => {
    setCameraOpened(true);
    setCameraItem(el);
  };

  const screenshot = () => {
    const imageSrc = webRef.current.getScreenshot();
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === cameraItem.id
          ? { ...item, img: imageSrc, receiptadded: true }
          : item,
      ),
    );
    setCameraOpened(false);
    console.log(cartItems);
  };

  const closeCamera = () => {
    setCameraOpened(false);
  };

  return (
    <>
      {cameraOpened && (
        <div className="container">
          <Webcam
            className="camera"
            ref={webRef}
            screenshotFormat="image/jpeg"
          />
          <button
            className="closeCameraButton"
            onClick={() => {
              closeCamera();
            }}
          >
            Close Camera
          </button>
          <button
            className="screenshotButton"
            onClick={() => {
              screenshot();
            }}
          ></button>
        </div>
      )}
      <div className="headerCart">
        <p className="SPLabel">SMARTPHARM</p>
        <a onClick={() => navigate("/CustomerShop")}>Continue Shopping</a>
        <a onClick={() => navigate("/")}>Logout</a>
      </div>
      <div className="items">
        {cartItems.map((el, index) => (
          <div
            key={index}
            className={
              el.stockStatus === "OK"
                ? "okCartItem"
                : el.stockStatus === "OUT OF STOCK"
                  ? "outofstockCartItem"
                  : "notenoughstockCartItem"
            }
          >
            <div className="productPicture">
              <img src={el.product.image} />
            </div>
            <div className="cartLabel">{el.product.label}</div>
            <div className="cartQuantity">Quantity: {el.quantity}</div>
            <div className="cartPrice">Price: {el.product.price}$</div>
            {el.product.needsreceipt && (
              <div className="receiptContainer">
                {!el.receiptadded ? (
                  <p className="noReceipt">Add Receipt</p>
                ) : (
                  <p
                    className="addedReceipt"
                    onClick={() => {
                      setShowReceipt(true);
                    }}
                  >
                    Receipt Added
                  </p>
                )}
                <button
                  className="cameraButton"
                  onClick={() => {
                    openCamera(el);
                  }}
                >
                  Camera
                </button>
              </div>
            )}
            {!el.product.needsreceipt && <div className="filler"></div>}

            <button
              onClick={() => {
                removeFromCart(el);
              }}
            >
              Remove
            </button>
            {showReceipt && (
              <div className="container">
                <img src={el.img} className="receiptPicture" />
                <button
                  className="XButton"
                  onClick={() => setShowReceipt(false)}
                >
                  X
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="checkoutContainer">
        <input
          type="text"
          value={discountCodeInput}
          onChange={(e) => {
            setDiscountCodeInput(e.target.value);
          }}
          placeholder="Type in your Discount Code..."
        />
        {showInvalidMessage && (
          <p className="invalidMessage">Invalid Discount Code</p>
        )}
        <button
          onClick={() => {
            applyDiscount();
          }}
        >
          Apply Discount
        </button>
        <p
          className={
            userCart.originalprice === userCart.totalprice
              ? "undiscountedPrice"
              : "discountedPrice"
          }
        >
          Total Price: {userCart.totalprice}$
        </p>
        <button
          disabled={
            cartItems.some(
              (item) =>
                item.stockStatus === "OUT OF STOCK" ||
                item.stockStatus === "NOT ENOUGH STOCK",
            ) ||
            cartItems.some((item) => item.product.needsreceipt && !item.img)
          }
          onClick={() => setShowCheckoutPopup(true)}
        >
          Checkout
        </button>
      </div>
      {showCheckoutPopup && (
        <div className="checkoutPopup">
          <input
            type="text"
            value={checkoutData.city}
            onChange={(e) =>
              setCheckoutData((current) => ({
                ...current,
                city: e.target.value,
              }))
            }
            placeholder="Enter City"
            required
          />
          <input
            type="text"
            value={checkoutData.address}
            onChange={(e) =>
              setCheckoutData((current) => ({
                ...current,
                address: e.target.value,
              }))
            }
            placeholder="Enter Address"
            required
          />
          <input
            type="text"
            value={checkoutData.phone}
            onChange={(e) =>
              setCheckoutData((current) => ({
                ...current,
                phone: e.target.value,
              }))
            }
            placeholder="Enter Your Phone Number"
            required
          />
          <div className="checkoutButtons">
            <button
              onClick={() => {
                order();
              }}
            >
              Order
            </button>
            <button onClick={() => setShowCheckoutPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}

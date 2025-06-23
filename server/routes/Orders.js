const express = require("express");
const router = express.Router();
const { Order, OrderItem, User, Cart, Product, ProductVariant, Payment } = require("../models");
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission'); 
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Get all order
router.get("/", async (req, res) => {
    try {
        const order = await Order.findAll({ include: User });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve order." });
    }
});

// Get order by ID
router.get("/:orderID", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderID, {
      include: [
        User,
        {
          model: OrderItem,
          include: [
            {
              model: ProductVariant,
              include: [Product],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve order." });
  }
});

// Create new order
router.post("/", async (req, res) => {
    try {
        const { status, orderUserID } = req.body;
        const user = await User.findByPk(orderUserID);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        const newOrder = await Order.create({ status, orderUserID });
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: "Failed to create order." });
    }
});

// POST /checkout
router.post("/checkout", async (req, res) => {
    const { userID, paymentMethod } = req.body;

    // Ensure paymentMethod is provided
    if (!paymentMethod) {
        return res.status(400).json({ error: "Payment method is required." });
    }

    try {
        // 1. Fetch user
        const user = await User.findByPk(userID);
        if (!user) return res.status(404).json({ error: "User not found." });

        // 2. Get all cart items for this user
        const cartItems = await Cart.findAll({
            where: { cartUserID: userID },
            include: [
                {
                    model: ProductVariant,
                    include: [Product]
                }
            ]
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ error: "Cart is empty." });
        }

        // 3. Create new order
        const order = await Order.create({ orderUserID: userID, status: "pending", totalPrice: 0 });

        let totalPrice = 0;

        // 4. Loop through cart items and create orderItems
        for (const item of cartItems) {
            const basePrice = Number(item.ProductVariant.Product.cmimi);
            const itemTotal = basePrice * item.sasia;

            await OrderItem.create({
                sasia: item.sasia,
                cmimi: itemTotal,
                orderItemOrderID: order.orderID,
                orderItemProductVariantID: item.cartProductVariantID
            });

            totalPrice += itemTotal;
        }

        // 5. Update order total price
        await Order.update({ totalPrice }, { where: { orderID: order.orderID } });

        // 7. Create a Payment record
        const payment = await Payment.create({
            metoda: paymentMethod,       // Payment method: e.g., 'credit_card', 'paypal', etc.
            status: 'pending',           // Set the payment status to 'pending'
            data: {},  // Placeholder for the actual transaction ID
            paymentOrderID: order.orderID  // Link the payment to the order
        });

        await Cart.destroy({ where: { cartUserID: userID } });

        // 8. Return order ID and payment ID
        res.status(201).json({
            message: "Checkout initialized",
            orderID: order.orderID,
            paymentID: payment.paymentID,
            totalPrice,
        });
    } catch (error) {
        console.error("Checkout error:", error);
        res.status(500).json({ error: "Checkout failed.", error });
    }
});


//create checkout me stripe
router.post("/create-checkout-session", async (req, res) => {
  const { orderID, paymentID } = req.body;

  try {
    const order = await Order.findByPk(orderID, {
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: ProductVariant,
              include: [Product],
            },
          ],
        },
      ],
    });

    if (!order) return res.status(404).json({ error: "Order not found." });

    // Find payment to check method
    const payment = await Payment.findByPk(paymentID);
    if (!payment) return res.status(404).json({ error: "Payment not found." });

    if (payment.metoda === "cash") {
      return res.status(400).json({ error: "Cash payment does not require Stripe session." });
    }

    // ... create line items & stripe session as before ...
    const lineItems = order.OrderItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.ProductVariant?.Product?.emri || "Product",
        },
        unit_amount: Math.round((item.cmimi / item.sasia) * 100),
      },
      quantity: item.sasia,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      // Pass orderID as query param in success URL:
      success_url: `http://localhost:3000/success?orderID=${order.orderID}`,
      cancel_url: 'http://localhost:3000/cart',
      metadata: {
        orderID: order.orderID,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: "Failed to create Stripe session" });
  }
});


// Delete order by ID
router.delete("/:orderID", auth, checkRole(["admin"]), async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.orderID);
        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }
        await order.destroy();
        res.json({ message: "Order deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete order." });
    }
});

module.exports = router;

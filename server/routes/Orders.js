const express = require("express");
const router = express.Router();
const { Order, OrderItem, User, Cart, Product, ProductVariant, Payment, Coupon } = require("../models");
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
    const { userID, paymentMethod, couponCode } = req.body;  // <-- added couponCode

    if (!paymentMethod) {
        return res.status(400).json({ error: "Payment method is required." });
    }

    try {
        const user = await User.findByPk(userID);
        if (!user) return res.status(404).json({ error: "User not found." });

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

        let totalPrice = 0;
        for (const item of cartItems) {
            const basePrice = Number(item.ProductVariant.Product.cmimi);
            totalPrice += basePrice * item.sasia;
        }

        // Apply coupon discount if couponCode is provided
        let discountAmount = 0;
        if (couponCode) {
            const coupon = await Coupon.findOne({ where: { kodi: couponCode } });
            if (!coupon) {
                return res.status(400).json({ error: "Invalid coupon code." });
            }
            // Optionally add expiration/usage checks here
            discountAmount = Number(coupon.shuma) || 0;
            totalPrice = Math.max(totalPrice - discountAmount, 0);
        }

        const order = await Order.create({
            orderUserID: userID,
            status: "pending",
            totalPrice,
        });

        for (const item of cartItems) {
            const basePrice = Number(item.ProductVariant.Product.cmimi);
            const itemTotal = basePrice * item.sasia;
            await OrderItem.create({
                sasia: item.sasia,
                cmimi: itemTotal,
                orderItemOrderID: order.orderID,
                orderItemProductVariantID: item.cartProductVariantID,
            });
        }

        const payment = await Payment.create({
            metoda: paymentMethod,
            status: 'pending',
            data: {},
            paymentOrderID: order.orderID,
            amount: totalPrice, // optional: store final amount here
        });

        await Cart.destroy({ where: { cartUserID: userID } });

        res.status(201).json({
            message: "Checkout initialized",
            orderID: order.orderID,
            paymentID: payment.paymentID,
            totalPrice,
            discountAmount,
        });
    } catch (error) {
        console.error("Checkout error:", error);
        res.status(500).json({ error: "Checkout failed.", error });
    }
});

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

    const payment = await Payment.findByPk(paymentID);
    if (!payment) return res.status(404).json({ error: "Payment not found." });

    if (payment.metoda === "cash") {
      return res.status(400).json({ error: "Cash payment does not require Stripe session." });
    }

    // Create single line item with total price after discount
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Order #${order.orderID} - Total after discount`,
            },
            unit_amount: Math.round(order.totalPrice * 100), // totalPrice already discounted
          },
          quantity: 1,
        },
      ],
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

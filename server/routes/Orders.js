const express = require("express");
const router = express.Router();
const { Order, OrderItem, User, Cart, Product, ProductVariant, Payment, Coupon, Return } = require("../models");
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission'); 
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Get all order
router.get("/", async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User },          // Include user info
        { model: Payment },       // Include payments info
        { model: OrderItem, include: [ProductVariant] }
      ],
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve orders." });
  }
});

// Get user by ID including orders and payments
router.get("/user/:userID", auth, async (req, res) => {
  try {
    const { userID } = req.params;

    // Fetch the user by ID
    const user = await User.findByPk(userID, {
      include: [
        {
          model: Order, // Include related orders
          include: [
            {
              model: OrderItem, // Include items in each order
              include: [
                {
                  model: ProductVariant, // Include product variant details
                  include: [Product], // Include product details
                },
              ],
            },
            {
              model: Payment, // Include payment information
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(user);
  } catch (error) {
    console.error("Failed to retrieve user details:", error);
    res.status(500).json({ error: "Failed to retrieve user details." });
  }
});

// Get all orders for a specific user
router.get("/user", auth, async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { orderUserID: req.user.userID },
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
                {
                    model: Return, // Include associated returns
                },
            ],
        });

        res.json(orders);
    } catch (error) {
        console.error("Failed to retrieve orders:", error);
        res.status(500).json({ error: "Failed to retrieve orders." });
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
        {
          model: Payment, // Include Payment model
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    res.json(order);
  } catch (error) {
    console.error("Failed to retrieve order:", error);
    res.status(500).json({ error: "Failed to retrieve order." });
  }
});


// Create new order
router.post("/", async (req, res) => {
  try {
    const { orderUserID, paymentMethod, couponCode, status, orderItems } = req.body;

    // Validate user
    const user = await User.findByPk(orderUserID);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ error: "Order items are required." });
    }

    // Calculate total price from orderItems
    let totalPrice = 0;
    for (const item of orderItems) {
      const productVariant = await ProductVariant.findByPk(item.productVariantID, {
        include: [Product],
      });

      if (!productVariant || !productVariant.Product) {
        return res.status(400).json({ error: `Product variant ${item.productVariantID} not found.` });
      }

      const price = Number(productVariant.Product.cmimi);
      totalPrice += price * item.quantity;
    }

    // Apply coupon discount if present
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ where: { kodi: couponCode } });
      if (!coupon) return res.status(400).json({ error: "Invalid coupon code." });
      discountAmount = Number(coupon.shuma) || 0;
      totalPrice = Math.max(totalPrice - discountAmount, 0);
    }

    // Create order
    const newOrder = await Order.create({
      orderUserID,
      paymentMethod,
      couponCode,
      status,
      totalPrice: totalPrice.toFixed(2),
      discount: discountAmount.toFixed(2),
    });

    // Create order items
    for (const item of orderItems) {
      const productVariant = await ProductVariant.findByPk(item.productVariantID, {
        include: [Product],
      });
      const price = Number(productVariant.Product.cmimi);
      await OrderItem.create({
        sasia: item.quantity,
        cmimi: price * item.quantity,
        orderItemOrderID: newOrder.orderID,
        orderItemProductVariantID: item.productVariantID,
      });
    }

    // Create payment
    const newPayment = await Payment.create({
      metoda: paymentMethod || "unknown", // Default to "unknown" if not provided
      status: "pending", // Default status for payment
      data: {}, // Add any necessary initial data here
      paymentOrderID: newOrder.orderID, // Link payment to the created order
    });

    res.status(201).json({ 
      message: "Order and payment created successfully.",
      order: newOrder,
      payment: newPayment,
    });
  } catch (error) {
    console.error("Failed to create order:", error);
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
            couponCode,  // <- you pass couponCode here
            paymentMethod,
            discount: discountAmount,  // save discount here
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

        const newPayment = await Payment.create({
          metoda: paymentMethod || "unknown", // Default to "unknown" if not provided
          status: "pending", // Default status for payment
          data: {}, // Add any necessary initial data here
          paymentOrderID: order.orderID, // Link payment to the created order
        });

        await Cart.destroy({ where: { cartUserID: userID } });

        res.status(201).json({
            message: "Checkout initialized",
            orderID: order.orderID,
            paymentID: newPayment.paymentID,
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
      success_url: `http://localhost:3000/success?orderID=${order.orderID}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: 'http://localhost:3000/cart',
      metadata: {
        orderID: order.orderID,
        paymentID: payment.paymentID.toString(),
        userID: order.orderUserID.toString(), // if you want to clear the cart
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: "Failed to create Stripe session" });
  }
});

// Update existing order (admin)
router.put("/:orderID", auth, checkRole(["admin"]), async (req, res) => {
  try {
    const { orderID } = req.params;
    const { orderUserID, paymentMethod, couponCode, status, orderItems } = req.body;

    const order = await Order.findByPk(orderID);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Validate user
    const user = await User.findByPk(orderUserID);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ error: "Order items are required." });
    }

    // Calculate total price from orderItems
    let totalPrice = 0;
    for (const item of orderItems) {
      const productVariant = await ProductVariant.findByPk(item.productVariantID, {
        include: [Product],
      });

      if (!productVariant || !productVariant.Product) {
        return res.status(400).json({ error: `Product variant ${item.productVariantID} not found.` });
      }

      const price = Number(productVariant.Product.cmimi);
      totalPrice += price * item.quantity;
    }

    // Apply coupon discount if no coupon was applied previously
    let discountAmount = Number(order.discount || 0); // Start with existing discount
    if (!order.couponCode && couponCode) {
      const coupon = await Coupon.findOne({ where: { kodi: couponCode } });
      if (!coupon) return res.status(400).json({ error: "Invalid coupon code." });
      discountAmount = Number(coupon.shuma) || 0;
      totalPrice = Math.max(totalPrice - discountAmount, 0);

      // Update the order's coupon code
      await order.update({ couponCode });
    } else if (order.couponCode && couponCode && order.couponCode !== couponCode) {
      return res.status(400).json({ error: "A coupon is already applied and cannot be changed." });
    } else {
      totalPrice = Math.max(totalPrice - discountAmount, 0);
    }

    // Update order data (excluding couponCode unless applied above)
    await order.update({
      orderUserID,
      paymentMethod,
      status,
      totalPrice: totalPrice.toFixed(2),
      discount: discountAmount.toFixed(2),
    });

    // Also update payment method in Payment model(s) linked to this order
    await Payment.update(
      { metoda: paymentMethod },
      { where: { paymentOrderID: orderID } }
    );

    // Delete old order items
    await OrderItem.destroy({ where: { orderItemOrderID: orderID } });

    // Create new order items
    for (const item of orderItems) {
      const productVariant = await ProductVariant.findByPk(item.productVariantID, {
        include: [Product],
      });
      const price = Number(productVariant.Product.cmimi);
      await OrderItem.create({
        sasia: item.quantity,
        cmimi: price * item.quantity,
        orderItemOrderID: orderID,
        orderItemProductVariantID: item.productVariantID,
      });
    }

    res.json({ message: "Order and payment updated successfully.", order });
  } catch (error) {
    console.error("Failed to update order:", error);
    res.status(500).json({ error: "Failed to update order." });
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

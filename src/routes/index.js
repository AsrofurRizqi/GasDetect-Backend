const mainRoutes = require("express").Router();
const authRoutes = require("./AuthRoutes");
const notifRoutes = require("./NotifRoutes");
const userRoutes = require("./UserRoutes");
const dataRoutes = require("./DataRoutes");
const deviceRoutes = require("./DeviceRoutes");

mainRoutes.use("/auth", authRoutes);
mainRoutes.use("/notif", notifRoutes);
mainRoutes.use("/user", userRoutes);
mainRoutes.use("/data", dataRoutes);
mainRoutes.use("/device", deviceRoutes);

module.exports= mainRoutes;
const express = require("express");
const PDFDocument = require("pdfkit");
const pdfRouter = require("./routes/pdfRoutes");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Working!");
});

app.use("/pdf", pdfRouter);

app.listen("3000", () => {
    console.log("App is running on port 3000");
});

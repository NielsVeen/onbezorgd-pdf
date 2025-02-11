const express = require("express");
const pdfRouter = express.Router();
const [transitieVergoeding, wwUitkering, nettoTransitievergoeding, brutoTransitievergoeding] = require("../pdf/createPDF");

pdfRouter.post("/transitie-vergoeding", (req, res) => {
    let data = req.body;
    const stream = res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline;filename=berekening_transitievergoeding.pdf",
    });

    transitieVergoeding(
        data,
        (chunk) => stream.write(chunk),
        () => stream.end()
    );
});

pdfRouter.post("/transitie-vergoeding-netto", (req, res) => {
    let data = req.body;
    const stream = res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline;filename=berekening_transitievergoeding.pdf",
    });

    nettoTransitievergoeding(
        data,
        (chunk) => stream.write(chunk),
        () => stream.end()
    );
});

pdfRouter.post("/transitie-vergoeding-bruto", (req, res) => {
    let data = req.body;
    const stream = res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline;filename=berekening_transitievergoeding.pdf",
    });

    brutoTransitievergoeding(
        data,
        (chunk) => stream.write(chunk),
        () => stream.end()
    );
});

pdfRouter.post("/ww-uitkering", (req, res) => {
    let data = req.body;

    const stream = res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline;filename=berekening_ww_uitkering.pdf",
    });

    wwUitkering(
        data,
        (chunk) => stream.write(chunk),
        () => stream.end()
    );
});

module.exports = pdfRouter;

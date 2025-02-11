const PDFDocument = require("pdfkit");

const generateHeader = (doc) => {
    doc.image("./images/logo.png", { width: 200 });
    doc.fontSize(10);
    let width = doc.page.width;
    doc.font("fonts/Poppins-Light.ttf");

    doc.text("info@onbezorgdontslag.nl", 0, 50, { align: "right", link: "mailto:info@onbezorgdontslag.nl" });
    doc.text("(010) 254 57 72", 0, 70, { align: "right", link: "tel:+31102545772" });
    doc.text("onbezorgdontslag.nl", 0, 90, { align: "right", link: "https://onbezorgdontslag.nl" });
};

const generateFooter = (doc) => {
    doc.fontSize(8).text("onbezorgd ontslag aanvaardt geen aansprakelijkheid voor mogelijke fouten in deze berekening.", 50, doc.page.height - 50, { height: 12, align: "center" });
    doc.text("Twijfel je?                              ", 0, doc.page.height - 38, { height: 12, continued: true, align: "center" }).text("Neem contact met mij (Bob) op.", {
        link: "https://www.onbezorgdontslag.nl/contact",
        underline: true,
    });
};

const generateTablerow = (doc, y, c1, c2) => {
    doc.fontSize(12).font("fonts/Poppins-Medium.ttf").text(c1, 50, y).font("fonts/Poppins-Light.ttf").text(c2, 0, y, { align: "right" });
};

const generateSecion = (doc, sectionTitle, y, data, mapping) => {
    doc.font("fonts/Poppins-SemiBold.ttf").fontSize(16).text(sectionTitle, 50, y);
    totalOffset = y;
    Object.keys(data).map((item) => {
        totalOffset += 30;
        generateTablerow(doc, totalOffset, mapping[item], data[item]);
    });
    return totalOffset;
};

const generateTotalSecion = (doc, sectionTitle, y, object, mappings) => {
    doc.font("fonts/Poppins-SemiBold.ttf").fontSize(16).text(sectionTitle, 50, y);
    totalOffset = y;
    Object.keys(object).map((item, idx) => {
        totalOffset += 30;
        if (idx + 1 === Object.keys(object).length) {
            width = doc.page.width;
            doc.moveTo(50, totalOffset)
                .lineTo(width - 50, totalOffset)
                .stroke();
            totalOffset += 15;
        }
        generateTablerow(doc, totalOffset, mappings[item], object[item]);
    });
    return totalOffset;
};

function transitieVergoeding(data, dataCallback, endCallback) {
    let doc = new PDFDocument({ margin: 50 });
    doc.on("data", dataCallback);
    doc.on("end", endCallback);
    doc.fillColor("#050A30");
    generateHeader(doc);
    doc.font("fonts/Poppins-SemiBold.ttf");
    doc.moveDown();
    doc.fontSize(20);
    doc.text("Jouw transitievergoeding", 50, 150);
    let workerInfo = {
        ...data["worker-info"],
        salary: data["worker-info"]["salary"].toLocaleString("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    };

    let offSet = generateSecion(doc, "Gegevens werknemer", 200, workerInfo, { "date-start": "Datum in dienst", "date-end": "Datum uit dienst", salary: "Bruto maandinkomen" });

    doc.font("fonts/Poppins-SemiBold.ttf")
        .fontSize(16)
        .text("Duur dienstverband", 50, offSet + 50);
    offSet += 50;
    doc.fontSize(12).font("fonts/Poppins-Medium.ttf").text(`${data["history"]["years"]} jaren, ${data["history"]["months"]} maanden, ${data["history"]["days"]} dagen`).font("fonts/Poppins-Light.ttf");

    offSet += 30;

    // offSet = generateSecion(doc, "Duur dienstverband", offSet + 50, data["history"], { years: "Jaren", months: "Maanden", days: "Dagen" });

    const yearsComp = data["history"]["years"] * (1 / 3) * data["worker-info"].salary;
    const monthsComp = data["history"]["months"] * (1 / 3) * (1 / 12) * data["worker-info"].salary;
    const daysComp = data["history"]["days"] * (1 / 3) * (1 / 365) * data["worker-info"].salary;
    const totalComp = yearsComp + monthsComp + daysComp;

    let totalObject = {
        years: `€ ${parseFloat(yearsComp.toFixed(2)).toLocaleString("nl-NL")}`,
        months: `€ ${parseFloat(monthsComp.toFixed(2)).toLocaleString("nl-NL")}`,
        days: `€ ${parseFloat(daysComp.toFixed(2)).toLocaleString("nl-NL")}`,
        total: `€ ${parseFloat(totalComp.toFixed(2)).toLocaleString("nl-NL")}`,
    };
    console.log(totalObject["years"].split("€"));

    let totalMapping = {
        years: `Jaren: ${data["history"]["years"]} * 1/3 * € ${data["worker-info"]["salary"]}`,
        months: `Maanden: ${data["history"]["months"]} * 1/3 * 1/12  * € ${data["worker-info"]["salary"]}`,
        days: `Dagen: ${data["history"]["days"]} * 1/3 * 1/365 * € ${data["worker-info"]["salary"]}`,
        total: "Hoogte van transitievergoeding",
    };

    generateTotalSecion(doc, "Berekening transitievergoeding", offSet + 50, totalObject, totalMapping);
    offSet += 210;
    // doc.fontSize(10)
    //     .text("Ontdek snel de exacte berekening van jouw transitievergoeding op ", 50, offSet, { continued: true })
    //     .text("deze pagina", { link: "http://onbezorgdontslag.nl/berekenen/transitievergoeding", underline: true });

    // offSet += 30;

    doc.font("fonts/Poppins-Light.ttf")
        .fontSize(10)
        .text("Of je nu ontslagen bent, vreest voor ontslag of een vaststellingsovereenkomst hebt ontvangen: op ", 50, offSet)
        .text("deze overzichtspagina ", { link: "https://www.onbezorgdontslag.nl/wat-is/", underline: true, continued: true })
        .text("vind je met één klik de antwoorden die je zoekt.", { link: null, underline: false });

    generateFooter(doc);
    doc.end();
}
function brutoTransitievergoeding(data, dataCallback, endCallback) {
    let doc = new PDFDocument({ margin: 50 });
    doc.on("data", dataCallback);
    doc.on("end", endCallback);
    doc.fillColor("#050A30");
    generateHeader(doc);
    doc.font("fonts/Poppins-SemiBold.ttf");
    doc.moveDown();
    doc.fontSize(20);
    doc.text("Jouw bruto transitievergoeding", 50, 150);
    let offSet = generateSecion(doc, "Gegevens werknemer", 200, { ...data["worker-info"] }, { "date-start": "Datum in dienst", "date-end": "Datum uit dienst", salary: "Bruto maandinkomen" });

    doc.font("fonts/Poppins-SemiBold.ttf")
        .fontSize(16)
        .text("Duur dienstverband", 50, offSet + 50);
    offSet += 50;
    doc.fontSize(12).font("fonts/Poppins-Medium.ttf").text(`${data["history"]["years"]} jaren, ${data["history"]["months"]} maanden, ${data["history"]["days"]} dagen`).font("fonts/Poppins-Light.ttf");

    offSet += 30;

    // offSet = generateSecion(doc, "Duur dienstverband", offSet + 50, data["history"], { years: "Jaren", months: "Maanden", days: "Dagen" });

    const yearsComp = data["history"]["years"] * (1 / 3) * data["worker-info"].salary;
    const monthsComp = data["history"]["months"] * (1 / 3) * (1 / 12) * data["worker-info"].salary;
    const daysComp = data["history"]["days"] * (1 / 3) * (1 / 365) * data["worker-info"].salary;
    const totalComp = yearsComp + monthsComp + daysComp;

    let totalObject = {
        years: `€ ${parseFloat(yearsComp.toFixed(2)).toLocaleString("nl-NL")}`,
        months: `€ ${parseFloat(monthsComp.toFixed(2)).toLocaleString("nl-NL")}`,
        days: `€ ${parseFloat(daysComp.toFixed(2)).toLocaleString("nl-NL")}`,
        total: `€ ${parseFloat(totalComp.toFixed(2)).toLocaleString("nl-NL")}`,
    };
    console.log(totalObject["years"].split("€"));

    let totalMapping = {
        years: `Jaren: ${data["history"]["years"]} * 1/3 * € ${data["worker-info"]["salary"]}`,
        months: `Maanden: ${data["history"]["months"]} * 1/3 * 1/12  * € ${data["worker-info"]["salary"]}`,
        days: `Dagen: ${data["history"]["days"]} * 1/3 * 1/365 * € ${data["worker-info"]["salary"]}`,
        total: "Bruto transitievergoeding",
    };

    generateTotalSecion(doc, "Berekening transitievergoeding", offSet + 50, totalObject, totalMapping);
    offSet += 210;
    // doc.fontSize(10)
    //     .text("Ontdek snel de exacte berekening van jouw transitievergoeding op ", 50, offSet, { continued: true })
    //     .text("deze pagina", { link: "http://onbezorgdontslag.nl/berekenen/transitievergoeding", underline: true });

    // offSet += 30;

    doc.font("fonts/Poppins-Light.ttf")
        .fontSize(10)
        .text("Of je nu ontslagen bent, vreest voor ontslag of een vaststellingsovereenkomst hebt ontvangen: op ", 50, offSet)
        .text("deze overzichtspagina ", { link: "https://www.onbezorgdontslag.nl/wat-is/", underline: true, continued: true })
        .text("vind je met één klik de antwoorden die je zoekt.", { link: null, underline: false });

    generateFooter(doc);
    doc.end();
}

function nettoTransitievergoeding(data, dataCallback, endCallback) {
    let doc = new PDFDocument({ margin: 50 });
    doc.on("data", dataCallback);
    doc.on("end", endCallback);
    doc.fillColor("#050A30");
    generateHeader(doc);
    doc.font("fonts/Poppins-SemiBold.ttf");
    doc.moveDown();
    doc.fontSize(20);
    doc.text("Jouw transitievergoeding", 50, 150);
    let offSet = generateSecion(doc, "Gegevens werknemer", 200, data["worker-info"], {
        "date-start": "Datum in dienst",
        "date-end": "Datum uit dienst",
        salary: "Bruto maandsalaris",
        income: "Inkomen in jaar uitdiensttreding (excl. transitievergoeding)",
        totalIncome: "Inkomen in jaar uitdiensttreding (incl. transitievergoeding)",
    });

    doc.font("fonts/Poppins-SemiBold.ttf")
        .fontSize(16)
        .text("Duur dienstverband", 50, offSet + 50);
    offSet += 50;
    doc.fontSize(12).font("fonts/Poppins-Medium.ttf").text(`${data["history"]["years"]} jaren, ${data["history"]["months"]} maanden, ${data["history"]["days"]} dagen`).font("fonts/Poppins-Light.ttf");

    offSet += 30;

    let brutoMapping = {
        years: `Jaren: ${data["history"]["years"]} * 1/3 * ${data["worker-info"]["salary"]}`,
        months: `Maanden: ${data["history"]["months"]} * 1/3 * 1/12  * ${data["worker-info"]["salary"]}`,
        days: `Dagen: ${data["history"]["days"]} * 1/3 * 1/365 * ${data["worker-info"]["salary"]}`,
        "comp-bruto": "Bruto transitievergoeding",
    };
    generateFooter(doc);
    // Add new page
    doc.addPage();
    offSet = 0;
    offSet += 50;

    offSet = generateTotalSecion(doc, "Berekening bruto transitievergoeding", offSet, data["bruto"], brutoMapping);

    let nettoMapping = {
        "likely-tax": "Ingehouden belasting *",
        "true-tax": "Daadwerkelijke belasting **",
        "comp-netto": "Netto transitievergoeding (op basis van ingehouden belasting)",
    };
    offSet = generateTotalSecion(doc, "Berekening netto transitievergoeding", offSet + 50, data["netto"], nettoMapping);
    offSet += 30;
    doc.fontSize(10).font("fonts/Poppins-Light.ttf").text("* Belasting die je werkgever inhoudt op basis van je inkomen", 50, offSet);
    offSet += 15;
    doc.fontSize(10).font("fonts/Poppins-Light.ttf").text("** Belasting die je daadwerkelijk betaald na aangifte", 50, offSet);
    offSet += 50;
    doc.fontSize(16).font("fonts/Poppins-SemiBold.ttf").text("Toelichting", 50, offSet);
    offSet += 30;
    doc.fontSize(12).font("fonts/Poppins-Light.ttf").text(data["summary"], 50, offSet);

    offSet += 150;

    doc.font("fonts/Poppins-Light.ttf")
        .fontSize(10)
        .text("Of je nu ontslagen bent, vreest voor ontslag of een vaststellingsovereenkomst hebt ontvangen: op ", 50, offSet)
        .text("deze overzichtspagina ", { link: "https://www.onbezorgdontslag.nl/wat-is/", underline: true, continued: true })
        .text("vind je met één klik de antwoorden die je zoekt.", { link: null, underline: false });

    generateFooter(doc);
    doc.end();
}

function wwUitkering(data, dataCallback, endCallback) {
    let doc = new PDFDocument({ margin: 50 });
    doc.on("data", dataCallback);
    doc.on("end", endCallback);
    doc.fillColor("#050A30");
    generateHeader(doc);
    doc.font("fonts/Poppins-SemiBold.ttf");
    doc.moveDown();
    doc.fontSize(20);
    doc.text("Jouw WW-uitkering", 50, 150);
    doc.fontSize(12);

    doc.font("fonts/Poppins-Light.ttf");
    doc.text(data["text-top"], 50, 180);
    let offSet = generateSecion(doc, "Jouw gegevens", 180 + 50, data["info"], { "start-date": "Begin WW-uitkering", history: "Arbeidsverleden", daypay: "Dagloon" });
    offSet = generateSecion(doc, "Specificatie WW-uitkering", offSet + 50, data["specification"], {
        length: "Totale duur",
        "pay-base": "WW-uitkering eerste 2 maanden*",
        "pay-extended": "WW-uitkering daarna*",
    });

    doc.fontSize(8);
    doc.font("fonts/Poppins-Light.ttf");
    doc.text("*Extra: in mei ontvang je 8% vakantietoeslag bovenop je maandbedrag", 50, offSet + 30);
    doc.font("fonts/Poppins-SemiBold.ttf")
        .fontSize(16)
        .text("Toelichting", 50, offSet + 80);
    doc.font("fonts/Poppins-Light.ttf")
        .fontSize(10)
        .text(data["comments"], 50, offSet + 110);

    doc.font("fonts/Poppins-Light.ttf")
        .fontSize(10)
        .text("Of je nu ontslagen bent, vreest voor ontslag of een vaststellingsovereenkomst hebt ontvangen: op ", 50, offSet + 170)
        .text("deze overzichtspagina ", { link: "https://www.onbezorgdontslag.nl/wat-is/", underline: true, continued: true })
        .text("vind je met één klik de antwoorden die je zoekt.", { link: null, underline: false });

    generateFooter(doc);

    doc.end();
}

module.exports = [transitieVergoeding, wwUitkering, nettoTransitievergoeding, brutoTransitievergoeding];

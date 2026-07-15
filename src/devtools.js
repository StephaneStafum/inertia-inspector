console.log("Inertia Inspector devtools page loaded");

browser.devtools.panels.create(
    "Inertia Inspector",
    "",
    "/src/panel.html"
).then(() => {
    console.log("Panel created successfully");
}).catch((err) => {
    console.error("Panel creation failed:", err);
});
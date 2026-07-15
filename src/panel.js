const app = document.getElementById("app");

function buildTree(value, depth = 0) {
    if (value === null) {
        const span = document.createElement("span");
        span.className = "json-null";
        span.textContent = "null";
        return span;
    }

    if (typeof value === "boolean") {
        const span = document.createElement("span");
        span.className = "json-bool";
        span.textContent = String(value);
        return span;
    }

    if (typeof value === "number") {
        const span = document.createElement("span");
        span.className = "json-number";
        span.textContent = String(value);
        return span;
    }

    if (typeof value === "string") {
        const span = document.createElement("span");
        span.className = "json-string";
        span.textContent = `"${value}"`;
        return span;
    }

    const isArray = Array.isArray(value);
    const entries = isArray ? value.map((v, i) => [i, v]) : Object.entries(value);
    const [open, close] = isArray ? ["[", "]"] : ["{", "}"];

    const wrapper = document.createElement("span");

    if (entries.length === 0) {
        wrapper.textContent = open + close;
        return wrapper;
    }

    // Toggle button
    const toggle = document.createElement("span");
    toggle.className = "json-toggle";
    toggle.textContent = "▼";

    // Opening bracket
    const openBracket = document.createTextNode(open);

    // Placeholder shown when collapsed
    const placeholder = document.createElement("span");
    placeholder.className = "json-placeholder";
    placeholder.textContent = isArray ? ` ${entries.length} items ` : " … ";

    // Children list
    const list = document.createElement("ul");
    list.className = "json-tree";

    entries.forEach(([key, val], i) => {
        const li = document.createElement("li");

        if (!isArray) {
            const keySpan = document.createElement("span");
            keySpan.className = "json-key";
            keySpan.textContent = `"${key}"`;
            li.appendChild(keySpan);
            li.appendChild(document.createTextNode(": "));
        }

        li.appendChild(buildTree(val, depth + 1));

        if (i < entries.length - 1) {
            li.appendChild(document.createTextNode(","));
        }

        list.appendChild(li);
    });

    // Closing bracket
    const closeBracket = document.createTextNode(close);

    if (depth > 0) {
        wrapper.classList.add("json-collapsed");
        toggle.textContent = "▶";
    }

    toggle.addEventListener("click", () => {
        const collapsed = wrapper.classList.toggle("json-collapsed");
        toggle.textContent = collapsed ? "▶" : "▼";
    });

    wrapper.appendChild(toggle);
    wrapper.appendChild(openBracket);
    wrapper.appendChild(placeholder);
    wrapper.appendChild(list);
    wrapper.appendChild(closeBracket);

    return wrapper;
}

function fetchAndDisplay() {
    browser.devtools.inspectedWindow.eval(
        "JSON.stringify(window.history.state && window.history.state.page && window.history.state.page.props)"
    ).then(([result, exception]) => {
        app.innerHTML = "";

        if (exception) {
            app.textContent = "Erreur : " + (exception.value || JSON.stringify(exception));
            return;
        }

        if (!result || result === "null" || result === "false") {
            app.innerHTML = "<em>Aucune prop Inertia trouvée sur cette page.</em>";
            return;
        }

        try {
            const props = JSON.parse(result);
            app.appendChild(buildTree(props));
        } catch (e) {
            app.textContent = "Impossible de parser les props : " + e.message;
        }
    });
}

fetchAndDisplay();

// onNavigated only fires on full page loads; SPAs use history.pushState which
// doesn't trigger a network navigation. Poll the Inertia component name instead.
let lastComponent = null;

setInterval(() => {
    browser.devtools.inspectedWindow.eval(
        "window.history.state && window.history.state.page && window.history.state.page.component"
    ).then(([component]) => {
        if (component && component !== lastComponent) {
            lastComponent = component;
            fetchAndDisplay();
        }
    });
}, 500);

browser.devtools.network.onNavigated.addListener(() => {
    lastComponent = null;
    fetchAndDisplay();
});

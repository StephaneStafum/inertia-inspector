const app = document.getElementById("app");

function buildTree(value) {
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

        li.appendChild(buildTree(val));

        if (i < entries.length - 1) {
            li.appendChild(document.createTextNode(","));
        }

        list.appendChild(li);
    });

    // Closing bracket
    const closeBracket = document.createTextNode(close);

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

browser.devtools.network.onNavigated.addListener(fetchAndDisplay);

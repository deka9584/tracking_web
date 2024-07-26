const _app = {
    wssUrl: "ws://localhost:8000",
};

_app.startUp = () => {
    _app.display = document.querySelector(".display");
    _app.registerPopup = document.querySelector("#registerPopup");
    _app.nicknameForm = document.querySelector("#nicknameForm");

    _app.nicknameForm.addEventListener("submit", _app.nicknameForm_submitHandler);
    _app.setupWebSocket();
}

_app.setupWebSocket = () => {
    _app.wsClient = new WebSocket(_app.wssUrl);
    _app.wsClient.addEventListener("message", _app.wsClient_messageHandler);
}

_app.wsClient_messageHandler = (event) => {
    const messageData = JSON.parse(event.data);

    switch (messageData.type) {
        case "registration-request":
            _app.regUser = messageData.userId;
            _app.showRegisterPopup(true);
            break;
        case "history-data":
            _app.history = messageData.history;
            _app.updateDisplay();
            break;
        default:
            console.warn("Unknown message type:", messageData.type);
            break;
    }
}

_app.updateDisplay = () => {
    let htmlOut = "";

    if (Array.isArray(_app.history)) {
        for (let i = _app.history.length - 1; i >= 0; i--) {
            const data = _app.history[i];
    
            htmlOut += `
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td class="px-6 py-4">
                        ${data.name ?? data.user}
                    </td>
                    <td class="px-6 py-4">
                        ${data.pos.replace("POSTAZIONE_", "")}
                    </td>
                    <td class="px-6 py-4">
                        ${data.time}
                    </td>
                </tr>
            `;
        }
    }

    _app.display.innerHTML = htmlOut;
}

_app.showRegisterPopup = (show) => {
    _app.registerPopup.classList.toggle("hidden", !show);

    if (show) {
        _app.nicknameForm.nickname.focus();
    }
}

_app.nicknameForm_submitHandler = (event) => {
    const nickname = _app.nicknameForm.nickname.value;

    if (nickname && nickname.trim() !== "") {
        const data = {
            type: "registration-response",
            userId: _app.regUser,
            name: nickname,
        };

        console.log(_app.regUser, `Registered as ${nickname}`);
        _app.wsClient.send(JSON.stringify(data));
        _app.nicknameForm.reset();
        _app.showAlert("success", "Registrazione eseguita");
    }

    event.preventDefault();
    _app.showRegisterPopup(false);
}

_app.showAlert = (icon, title) => {
    if (window.Swal) {
        window.Swal.fire({
            icon,
            title,
            showConfirmButton: false,
            timer: 1500
        });

        return;
    }

    alert(title);
}

_app.startUp();
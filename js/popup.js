(function () {
    const CSS = `
        .grupo-popup {
            position: fixed;
            bottom: 28px;
            right: 28px;
            width: 300px;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 8px 40px rgba(0,0,0,0.18);
            z-index: 9999;
            overflow: hidden;
            transform: translateY(20px);
            opacity: 0;
            transition: transform 0.35s ease, opacity 0.35s ease;
            pointer-events: none;
        }
        .grupo-popup.visible {
            transform: translateY(0);
            opacity: 1;
            pointer-events: all;
        }
        .grupo-popup-header {
            background: #111;
            padding: 14px 18px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .grupo-popup-logo {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #fff;
            font-weight: 900;
            font-size: 15px;
            letter-spacing: 0.5px;
        }
        .grupo-popup-logo-sq {
            width: 32px;
            height: 32px;
            object-fit: contain;
        }
        .grupo-popup-close {
            position: absolute;
            top: 12px;
            right: 14px;
            background: none;
            border: none;
            color: #aaa;
            cursor: pointer;
            font-size: 20px;
            line-height: 1;
            padding: 0;
            transition: color 0.2s;
        }
        .grupo-popup-close:hover { color: #333; }
        .grupo-popup-body {
            padding: 20px 18px 22px;
        }
        .grupo-popup-title {
            font-size: 14px;
            font-weight: 800;
            color: #111;
            text-align: center;
            margin: 0 0 16px;
            line-height: 1.3;
            white-space: normal;
            word-break: break-word;
        }
        .grupo-popup-form {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .grupo-popup-input {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            font-size: 13px;
            color: #333;
            outline: none;
            box-sizing: border-box;
            transition: border-color 0.2s;
            font-family: Arial, sans-serif;
        }
        .grupo-popup-input:focus { border-color: #aaa; }
        .grupo-popup-btn {
            width: 100%;
            padding: 12px;
            background: #25d366;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            margin-top: 4px;
            transition: background 0.2s;
            font-family: Arial, sans-serif;
        }
        .grupo-popup-btn:hover { background: #1ebe5a; }
        .grupo-popup-note {
            font-size: 11px;
            color: #bbb;
            text-align: center;
            margin-top: 10px;
        }
    `;

    function inject() {
        const style = document.createElement('style');
        style.textContent = CSS;
        document.head.appendChild(style);

        const popup = document.createElement('div');
        popup.className = 'grupo-popup';
        popup.id = 'grupoPopup';
        popup.innerHTML = `
            <button class="grupo-popup-close" id="grupoPopupClose">×</button>
            <div class="grupo-popup-body">
                <p class="grupo-popup-title">Tenha Acesso ao nosso Grupo Exclusivo</p>
                <div class="grupo-popup-form">
                    <input class="grupo-popup-input" type="text"  placeholder="Seu nome">
                    <input class="grupo-popup-input" type="tel"   placeholder="WhatsApp">
                    <input class="grupo-popup-input" type="email" placeholder="Seu e-mail">
                    <button class="grupo-popup-btn">Entrar no Grupo</button>
                </div>
                <p class="grupo-popup-note">Receba ofertas e novidades exclusivas</p>
            </div>
        `;
        document.body.appendChild(popup);

        document.getElementById('grupoPopupClose').addEventListener('click', hidePopup);

        document.getElementById('grupoPopup').querySelector('.grupo-popup-btn').addEventListener('click', function () {
            hidePopup();
            sessionStorage.setItem('grupoPopupDone', '1');
        });
    }

    function showPopup() {
        if (sessionStorage.getItem('grupoPopupDone')) return;
        const popup = document.getElementById('grupoPopup');
        if (popup) popup.classList.add('visible');
    }

    function hidePopup() {
        const popup = document.getElementById('grupoPopup');
        if (popup) popup.classList.remove('visible');
        setTimeout(scheduleNext, 120000);
    }

    function scheduleNext() {
        if (!sessionStorage.getItem('grupoPopupDone')) {
            showPopup();
        }
    }

    inject();
    setTimeout(showPopup, 120000);
})();

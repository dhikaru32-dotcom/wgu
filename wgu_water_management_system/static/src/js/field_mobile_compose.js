var WGU_TRY = setInterval(function () {
    var pesanScreen = document.getElementById('m-screen-pesan');
    if (!pesanScreen) { return; }
    if (document.getElementById('m-compose-wrap')) { return; }

    var list = document.getElementById('m-pesan-list');
    if (!list) { return; }

    var composeWrap = document.createElement('div');
    composeWrap.id = 'm-compose-wrap';

    var composeButton = document.createElement('button');
    composeButton.type = 'button';
    composeButton.id = 'm-btn-compose';
    composeButton.className = 'm-compose-btn';
    composeButton.textContent = '+ Buat Pesan Kendala';

    var composeForm = document.createElement('div');
    composeForm.id = 'm-compose-form';
    composeForm.className = 'm-compose-form';
    composeForm.style.display = 'none';

    var composeTextarea = document.createElement('textarea');
    composeTextarea.id = 'm-compose-text';
    composeTextarea.rows = '3';
    composeTextarea.placeholder = 'Tulis kendala di lapangan...';

    var btnRow = document.createElement('div');

    var composeSendButton = document.createElement('button');
    composeSendButton.type = 'button';
    composeSendButton.id = 'm-compose-send';
    composeSendButton.className = 'm-compose-send';
    composeSendButton.textContent = 'Kirim ke Kantor';

    var composeCancelButton = document.createElement('button');
    composeCancelButton.type = 'button';
    composeCancelButton.id = 'm-compose-cancel';
    composeCancelButton.className = 'm-compose-cancel';
    composeCancelButton.textContent = 'Batal';

    btnRow.appendChild(composeSendButton);
    btnRow.appendChild(composeCancelButton);
    composeForm.appendChild(composeTextarea);
    composeForm.appendChild(btnRow);

    composeWrap.appendChild(composeButton);
    composeWrap.appendChild(composeForm);
    list.parentNode.insertBefore(composeWrap, list);

    composeButton.onclick = function () {
        if (composeForm.style.display === 'none') {
            composeForm.style.display = 'block';
            composeTextarea.focus();
        } else {
            composeForm.style.display = 'none';
        }
    };

    composeCancelButton.onclick = function () {
        composeForm.style.display = 'none';
    };

    composeSendButton.onclick = function () {
        var teks = composeTextarea.value.trim();
        var tombol = composeSendButton;
        if (!teks) {
            alert('Tulis pesan dulu.');
            return;
        }
        tombol.disabled = true;
        fetch('/pdam/api/pesan-petugas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ pesan: teks }),
        })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (data.status === 'ok') {
                    alert('Pesan terkirim ke kantor.');
                    composeTextarea.value = '';
                    composeForm.style.display = 'none';
                    tombol.disabled = false;
                    if (typeof window.wguMuatPesan === 'function') {
                        window.wguMuatPesan();
                    }
                } else {
                    alert(data.message || 'Gagal mengirim pesan.');
                    tombol.disabled = false;
                }
            })
            .catch(function () {
                alert('Gagal mengirim. Periksa koneksi.');
                tombol.disabled = false;
            });
    };

    clearInterval(WGU_TRY);
}, 2000);

const OBJECTS = [
    'Объекты',
    'Арбат',
    'Больничный',
    'ВЦ Тимирязев центр_ТЭ',
    'Гагаринский',
    'Monodom Lake',
    'Авиатика',
    'Викторенко',
    'Волоколамка',
    'Датский квартал',
    'Золоторожский',
    'Лайнер, д. 2',
    'Лайнер, д. 20а',
    'Малые Вешки',
    'Михалковский',
    'Мытищи',
    'Мытищи 1',
    'Мытищи 2',
    'Октябрьское поле (Берзарина)',
    'Петровский парк',
    'Реутов',
    'Символ',
    'Студия 12',
    'Фили Град (Береговой)',
    'Ярославка',
    'Красногвардейский',
    'Мач поинт',
    'Москино',
    'Немчиновка',
    'Одинцово',
    'Отпуск',
    'Офис',
    'Парк легенд (Автозаводская)',
    'Петровский парк',
    'Резиденция 1',
    'Резиденция 2',
    'Резиденция 3',
    'Резиденция 4',
    'Резиденция 5',
    'Резиденция 6',
    'Резиденция 7',
    'Резиденция 7 +',
    'Семеновский',
    'Сколково_Гимназия',
    'Сколково_Гиперкуб',
    'Сколково_Кварталы',
    'Сколково_Мильфей',
    'Сколково_Общежитие',
    'Сколково_Усадьба',
    'Сокол'
];

let currentUser = {
    firstName: '',
    lastName: ''
};

function init() {
    setupEventListeners();
    showRegistrationScreen();
}

function setupEventListeners() {
    document.getElementById('register-btn').addEventListener('click', handleRegister);
    document.getElementById('add-entry-btn').addEventListener('click', showEntryScreen);
    document.getElementById('cancel-btn').addEventListener('click', showMainScreen);
    document.getElementById('save-btn').addEventListener('click', handleSave);
    document.getElementById('object-select').addEventListener('change', validateForm);
}

function showRegistrationScreen() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('registration-screen').classList.remove('hidden');
}

function handleRegister() {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();

    if (!firstName || !lastName) {
        return;
    }

    currentUser.firstName = firstName;
    currentUser.lastName = lastName;
    saveUserData();
    showMainScreen();
}

function saveUserData() {
    localStorage.setItem('max_user', JSON.stringify(currentUser));
    if (window.WebApp && window.WebApp.DeviceStorage) {
        window.WebApp.DeviceStorage.setItem('max_user', JSON.stringify(currentUser)).catch(() => {});
    }
}

function loadUserData() {
    const saved = localStorage.getItem('max_user');
    if (saved) {
        try {
            currentUser = JSON.parse(saved);
            return;
        } catch {}
    }
    if (window.WebApp && window.WebApp.DeviceStorage) {
        window.WebApp.DeviceStorage.getItem('max_user').then(r => {
            if (r && r.value) {
                try {
                    currentUser = JSON.parse(r.value);
                } catch {}
            }
        }).catch(() => {});
    }
}

function showMainScreen() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('main-screen').classList.remove('hidden');
}

function showEntryScreen() {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('ru-RU');
    document.getElementById('current-date').value = formattedDate;

    const select = document.getElementById('object-select');
    select.innerHTML = '<option value="">Выберите объект</option>';
    OBJECTS.forEach(obj => {
        if (obj !== 'Объекты') {
            const option = document.createElement('option');
            option.value = obj;
            option.textContent = obj;
            select.appendChild(option);
        }
    });

    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('entry-screen').classList.remove('hidden');
    validateForm();
}

function validateForm() {
    const objectSelect = document.getElementById('object-select');
    const saveBtn = document.getElementById('save-btn');
    saveBtn.disabled = !objectSelect.value;
}

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzbYorIiueMrS81mo0-E9MrMVWNTaYu8Rj2El2XJJaN9PQalkDT5HJnP159-q710FWe-A/exec';
const CHAT_ID = '70605685';

function handleSave() {
    const date = document.getElementById('current-date').value;
    const object = document.getElementById('object-select').value;
    const fullName = currentUser.firstName + ' ' + currentUser.lastName;

    const data = {
        action: 'save_record',
        date: date,
        user: fullName,
        object: object,
        chat_id: CHAT_ID
    };

    console.log('=== SAVE CLICKED ===');
    console.log('Data:', JSON.stringify(data));

    // Отправляем в Google Таблицу
    var url = GOOGLE_SCRIPT_URL + '?data=' + encodeURIComponent(JSON.stringify(data));
    fetch(url, {
        method: 'GET'
    })
    .then(r => r.text())
    .then(result => {
        console.log('Google Sheet response:', result);
        alert('Данные сохранены!\n\n' +
              'Дата: ' + date + '\n' +
              'Пользователь: ' + fullName + '\n' +
              'Объект: ' + object);
    })
    .catch(err => {
        console.error('Error sending to Google:', err);
        alert('Ошибка сохранения');
    });

    showMainScreen();
}

document.addEventListener('DOMContentLoaded', init);

setTimeout(() => {
    loadUserData();
    if (currentUser.firstName && currentUser.lastName) {
        showMainScreen();
    }
}, 100);

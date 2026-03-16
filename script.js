function getCurrentTime() {
  return new Date().toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function addTextMessage(container, text, sender) {
  const message = document.createElement('div');
  const timestamp = document.createElement('small');

  message.className = `message ${sender}`;
  message.textContent = text;

  timestamp.textContent = getCurrentTime();
  message.appendChild(timestamp);

  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
}

function addAudioMessage(container, audioUrl, sender) {
  const wrapper = document.createElement('div');
  const title = document.createElement('div');
  const timestamp = document.createElement('small');
  const audio = document.createElement('audio');

  wrapper.className = `message ${sender}`;
  title.textContent = sender === 'user' ? 'Голосовое сообщение' : 'Голосовой ответ';
  audio.className = 'audio-message';
  audio.controls = true;
  audio.src = audioUrl;
  timestamp.textContent = getCurrentTime();

  wrapper.appendChild(title);
  wrapper.appendChild(audio);
  wrapper.appendChild(timestamp);
  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

function getAutomaticReply(userText) {
  const normalizedText = userText.toLowerCase();
  const rules = [
    {
      keywords: ['привет', 'здравствуй', 'добрый день'],
      answers: [
        'Привет! Рад видеть вас на моей странице.',
        'Здравствуйте! Спасибо, что заглянули на сайт.',
        'Привет! Готов рассказать о себе и своих проектах.'
      ]
    },
    {
      keywords: ['вшэ', 'университет', 'учеба', 'обучение'],
      answers: [
        'Я учусь в НИУ ВШЭ на направлении «Прикладная математика».',
        'Сейчас я студент ВШЭ и активно развиваюсь в прикладной математике и ИТ.',
        'Учеба в ВШЭ связана у меня с прикладной математикой и интересом к данным и моделям.'
      ]
    },
    {
      keywords: ['работа', 'опыт', 'cavise', 'сириус'],
      answers: [
        'У меня есть опыт в CAVISE и в Университете Сириус.',
        'Сейчас у меня есть опыт и в проектном управлении, и в исследовательской деятельности.',
        'Из опыта могу выделить работу в CAVISE и исследовательскую деятельность в Сириусе.'
      ]
    },
    {
      keywords: ['навыки', 'python', 'javascript', 'c++', 'java'],
      answers: [
        'Мои ключевые навыки: Python, C/C++, JavaScript, Java и инструменты разработки.',
        'Я работаю с Python, JavaScript и другими языками, а также использую Git, Docker и PostgreSQL.',
        'Технический стек включает языки программирования, машинное обучение и инструменты разработки.'
      ]
    },
    {
      keywords: ['контакт', 'почта', 'email', 'telegram', 'телефон'],
      answers: [
        'Мои контакты указаны ниже на странице: телефон, email и Telegram.',
        'Для связи можно использовать email, телефон или Telegram из раздела «Контакты».',
        'Связаться со мной можно через Telegram или по электронной почте.'
      ]
    },
    {
      keywords: ['карта', 'где', 'адрес', 'место'],
      answers: [
        'На карте отмечен НИУ ВШЭ в Москве.',
        'Интерактивная карта показывает расположение университета.',
        'Посмотрите карту на странице — там отмечена точка НИУ ВШЭ.'
      ]
    }
  ];

  for (let i = 0; i < rules.length; i += 1) {
    const matched = rules[i].keywords.some((keyword) => normalizedText.includes(keyword));

    if (matched) {
      const answers = rules[i].answers;
      return answers[Math.floor(Math.random() * answers.length)];
    }
  }

  const fallbackAnswers = [
    'Интересный вопрос. Это демо-чат, но я постарался сделать его похожим на живой.',
    'Я получил сообщение. Чат фиктивный, поэтому отвечаю локально прямо на странице.',
    'Спасибо за сообщение! Здесь работают только автоматические локальные ответы без сервера.'
  ];

  return fallbackAnswers[Math.floor(Math.random() * fallbackAnswers.length)];
}

function initializeMap() {
  const mapElement = document.getElementById('map');

  if (!mapElement || typeof ol === 'undefined') {
    return;
  }

  const hseCoordinates = ol.proj.fromLonLat([37.6482, 55.7596]);

  const marker = new ol.Feature({
    geometry: new ol.geom.Point(hseCoordinates)
  });

  marker.setStyle(
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 8,
        fill: new ol.style.Fill({ color: '#d32f2f' }),
        stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
      })
    })
  );

  new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      }),
      new ol.layer.Vector({
        source: new ol.source.Vector({
          features: [marker]
        })
      })
    ],
    view: new ol.View({
      center: hseCoordinates,
      zoom: 16
    })
  });
}

function initializeChat() {
  const chatContainer = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const voiceButton = document.getElementById('voice-button');
  const voiceStatus = document.getElementById('voice-status');

  if (!chatContainer || !chatForm || !chatInput || !voiceButton || !voiceStatus) {
    return;
  }

  addTextMessage(chatContainer, 'Здравствуйте! Это виртуальный чат автора страницы. Можете написать текст или отправить голосовое сообщение.', 'bot');

  chatForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const messageText = chatInput.value.trim();

    if (!messageText) {
      return;
    }

    addTextMessage(chatContainer, messageText, 'user');
    chatInput.value = '';

    window.setTimeout(function () {
      addTextMessage(chatContainer, getAutomaticReply(messageText), 'bot');
    }, 500 + Math.floor(Math.random() * 900));
  });

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
    voiceButton.disabled = true;
    voiceStatus.textContent = 'Браузер не поддерживает запись голосовых сообщений';
    return;
  }

  let mediaRecorder = null;
  let audioChunks = [];
  let activeStream = null;
  let isRecording = false;

  voiceButton.addEventListener('click', async function () {
    if (!isRecording) {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(activeStream);
        audioChunks = [];

        mediaRecorder.addEventListener('dataavailable', function (event) {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        });

        mediaRecorder.addEventListener('stop', function () {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);

          addAudioMessage(chatContainer, audioUrl, 'user');
          voiceStatus.textContent = 'Голосовое сообщение добавлено в чат';

          window.setTimeout(function () {
            addTextMessage(chatContainer, 'Получил голосовое сообщение. Это демо-чат, поэтому отвечаю текстом 😊', 'bot');
          }, 800);

          if (activeStream) {
            activeStream.getTracks().forEach(function (track) {
              track.stop();
            });
          }

          activeStream = null;
          isRecording = false;
          voiceButton.textContent = '🎙️ Записать голосовое';
        });

        mediaRecorder.start();
        isRecording = true;
        voiceButton.textContent = '⏹️ Остановить запись';
        voiceStatus.textContent = 'Идёт запись голосового сообщения...';
      } catch (error) {
        voiceStatus.textContent = 'Не удалось получить доступ к микрофону';
      }
    } else if (mediaRecorder) {
      mediaRecorder.stop();
    }
  });
}

function initializeFeedbackForm() {
  const feedbackForm = document.querySelector('.feedback-form');

  if (!feedbackForm) {
    return;
  }

  feedbackForm.addEventListener('submit', function (event) {
    event.preventDefault();
    alert('Спасибо! Форма демонстрационная, поэтому сообщение не отправляется на сервер.');
    feedbackForm.reset();
  });
}

window.onload = function () {
  initializeMap();
  initializeChat();
  initializeFeedbackForm();
};

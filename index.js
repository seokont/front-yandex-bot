(function () {
  const TRACK_URL = "https://playesop.com"; // временный домен

  const userAgent = navigator.userAgent;
  let clientIp = null;
  let eventBuffer = [];
  let touchPatterns = [];

  // Получаем IP
  fetch("https://api.ipify.org?format=json")
    .then((res) => res.json())
    .then((data) => {
      clientIp = data.ip;
      // как только IP получен — сразу отправляем данные
      sendData();
    })
    .catch((err) => {
      console.error("Не удалось получить IP:", err);
      // даже если IP не получен — всё равно отправляем
      sendData();
    });

  // Сбор событий (если нужно фиксировать хоть что-то до отправки)
  window.addEventListener("mousemove", (e) => {
    eventBuffer.push({
      type: "move",
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    });
  });

  window.addEventListener("click", (e) =>
    eventBuffer.push({
      type: "click",
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    })
  );

  window.addEventListener("touchmove", (e) => {
    touchPatterns.push({
      fingers: e.touches.length,
      pressure: e.touches[0].force || 0,
      coordinates: { x: e.touches[0].clientX, y: e.touches[0].clientY },
    });
  });

  // Отправка данных один раз
  function sendData() {
    const payload = {
      userAgent,
      ip: clientIp,
      events: eventBuffer,
      url: location.href,
      ts: Date.now(),
      touchPatterns: touchPatterns ?? [],
    };

    fetch(TRACK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch((err) => {
      console.error("Ошибка отправки трекинга:", err);
    });
  }
})();

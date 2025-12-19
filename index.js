(function () {
  const TRACK_URL = "https://yandexbonus.digital/track";

  const userAgent = navigator.userAgent;
  let clientIp = null;
  let eventBuffer = [];
  let touchPatterns = [];

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

  function sendData() {
    // if (eventBuffer.length === 0 && touchPatterns.length === 0) return;
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

  // Получаем IP и через 5 секунд отправляем всё, что накопилось
  fetch("https://api.ipify.org?format=json")
    .then((res) => res.json())
    .then((data) => {
      clientIp = data.ip || "";
      setTimeout(sendData, 5000);
    })
    .catch((err) => {
      // console.error("Не удалось получить IP:", err);
      // setTimeout(sendData, 5000);
    });
})();

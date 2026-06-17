function initFloaters() {
  const innerW = Math.max(LEVEL_GUTTER, frame.clientWidth - LEVEL_GUTTER);
  const innerH = frame.clientHeight;
  const entries = [
    { key: "hero", el: heroBox, anchor: () => ({ x: 20, y: 20 }) },
    {
      key: "stats",
      el: statsBox,
      anchor: () => {
        const rect = statsBox.getBoundingClientRect();
        return { x: Math.max(20, innerW - rect.width - 20), y: 20 };
      },
    },
    {
      key: "controls",
      el: controlsBox,
      anchor: () => {
        const rect = controlsBox.getBoundingClientRect();
        return {
          x: Math.max(20, (innerW - rect.width) / 2),
          y: innerH - rect.height - 20,
        };
      },
    },
  ];

  state.floaters = entries.map((entry) => {
    const rect = { width: entry.el.offsetWidth, height: entry.el.offsetHeight };
    const { x, y } = entry.anchor();
    const { vx, vy } = randomVelocity();
    return {
      key: entry.key,
      el: entry.el,
      x,
      y,
      w: rect.width,
      h: rect.height,
      vx,
      vy,
      pinned: false,
      angle: 0,
      lastBounce: 0,
    };
  });

  for (const floater of state.floaters) {
    floater.el.style.transform = `translate(${floater.x}px, ${floater.y}px)`;
  }
}

function updateFloaters(delta, now = performance.now()) {
  const bounds = {
    w: Math.max(LEVEL_GUTTER, frame.clientWidth - LEVEL_GUTTER),
    h: frame.clientHeight,
  };
  for (const floater of state.floaters) {
    if (floater.pinned) continue;
    floater.w = floater.el.offsetWidth;
    floater.h = floater.el.offsetHeight;

    floater.x += floater.vx * delta;
    floater.y += floater.vy * delta;
    let bounced = false;

    if (floater.x <= 0) {
      floater.x = 0;
      floater.vx = Math.abs(floater.vx);
      bounced = true;
    } else if (floater.x + floater.w >= bounds.w) {
      floater.x = bounds.w - floater.w;
      floater.vx = -Math.abs(floater.vx);
      bounced = true;
    }

    if (floater.y <= 0) {
      floater.y = 0;
      floater.vy = Math.abs(floater.vy);
      bounced = true;
    } else if (floater.y + floater.h >= bounds.h) {
      floater.y = bounds.h - floater.h;
      floater.vy = -Math.abs(floater.vy);
      bounced = true;
    }

    floater.x = Math.min(floater.x, Math.max(0, bounds.w - floater.w));
    floater.y = Math.min(floater.y, Math.max(0, bounds.h - floater.h));

    if (state.rotationEnabled && bounced) {
      const since = now - (floater.lastBounce || 0);
      if (since > 40) {
        floater.angle = (floater.angle + 90) % 360;
        floater.lastBounce = now;
      }
    }

    floater.el.style.transform = `translate(${floater.x}px, ${floater.y}px) rotate(${floater.angle}deg)`;
  }
}

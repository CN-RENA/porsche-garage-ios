const state = {
  page: "vehicle",
  car: "911 Carrera",
  locked: true,
  owner: "Roy",
  toastTimer: null,
};

const pageMeta = {
  discover: "发现",
  featured: "精选",
  vehicle: "车辆",
  services: "服务",
  profile: "我的",
};

const discoveryData = {
  recommend: {
    kicker: "保时捷车主专属",
    title: "心动找车",
    subtitle: "梦想座驾 一触即达",
    action: "即刻探索",
  },
  community: {
    kicker: "PANAMERA COMMUNITY",
    title: "与同路者相遇",
    subtitle: "分享每一段值得记住的旅程",
    action: "进入社区",
  },
  activity: {
    kicker: "OWNER EXPERIENCES",
    title: "本月车主活动",
    subtitle: "城市巡游 · 赛道体验 · 私享晚宴",
    action: "查看活动",
  },
};

const cars = {
  "911 Carrera": {
    range: "444",
    years: "2026",
    vin: "WP0A********5648",
    image: "assets/car-911.png",
    side: "assets/car-911-side.png",
    remote: "支持远程访问服务",
  },
  "Cayenne 铂金版": {
    range: "621",
    years: "2026",
    vin: "WP1A********9322",
    image: "assets/car-cayenne.png",
    side: "assets/car-cayenne-side.png",
    remote: "支持远程访问服务",
  },
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function refreshIcons(root = document) {
  if (window.lucide) {
    window.lucide.createIcons({
      attrs: { "aria-hidden": "true" },
      nameAttr: "data-lucide",
      root,
    });
  }
}

function navigate(page) {
  if (!pageMeta[page]) return;
  state.page = page;
  $$(".page").forEach((section) => {
    section.classList.toggle("is-active", section.dataset.page === page);
  });
  $$(".nav-item").forEach((button) => {
    const active = button.dataset.nav === page;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
  window.scrollTo({ top: 0, behavior: "instant" });
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function closeSheet() {
  $("#sheet-layer").hidden = true;
  document.body.style.overflow = "";
}

function openSheet({ kicker = "保时捷", title, content, afterOpen }) {
  $("#sheet-kicker").textContent = kicker;
  $("#sheet-title").textContent = title;
  $("#sheet-content").innerHTML = content;
  $("#sheet-layer").hidden = false;
  document.body.style.overflow = "hidden";
  refreshIcons($("#sheet-content"));
  if (afterOpen) afterOpen($("#sheet-content"));
  $("#sheet-layer .icon-button").focus({ preventScroll: true });
}

function formSheet({ kicker, title, fields, submitLabel, onSubmit }) {
  const fieldHtml = fields
    .map((field) => {
      if (field.type === "select") {
        return `<div class="field"><label for="${field.id}">${field.label}</label><select id="${field.id}" name="${field.id}">${field.options
          .map((option) => `<option>${option}</option>`)
          .join("")}</select></div>`;
      }
      return `<div class="field"><label for="${field.id}">${field.label}</label><input id="${field.id}" name="${field.id}" type="${field.type || "text"}" placeholder="${field.placeholder || ""}" value="${field.value || ""}" ${field.required ? "required" : ""}></div>`;
    })
    .join("");

  openSheet({
    kicker,
    title,
    content: `<form class="sheet-form" id="sheet-form">${fieldHtml}<div class="sheet-actions"><button class="button button-dark" type="submit">${submitLabel}</button><button class="button" type="button" data-close-sheet style="border:1px solid #e4e4e2;background:#fff">取消</button></div></form>`,
    afterOpen(root) {
      const form = $("#sheet-form", root);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(form));
        closeSheet();
        onSubmit(values);
      });
    },
  });
}

function updateCar(name) {
  const car = cars[name] || cars["911 Carrera"];
  state.car = name;
  $("#active-car-name").textContent = name;
  $("#active-car-image").src = car.image;
  $("#active-car-image").alt = name;
  $("#range-value").innerHTML = `${car.range}<small> km</small>`;
  $("#location-status").textContent = "无远程访问权限授权";
  $$(".garage-card").forEach((card) => {
    const key = card.dataset.profileCar === "911" ? "911 Carrera" : "Cayenne 铂金版";
    card.classList.toggle("is-selected", key === name);
  });
  navigate("vehicle");
}

function selectCarSheet() {
  openSheet({
    kicker: "我的车库",
    title: "车辆",
    content: `<div class="car-picker">${Object.keys(cars)
      .map(
        (name) => `<button class="car-pick-card${name === state.car ? " is-active" : ""}" type="button" data-select-car="${name}">
          <span class="car-pick-brand">${name === "911 Carrera" ? "911" : "Cayenne"}</span>
          <b>${name}</b>
          <img src="${cars[name].image}" alt="${name}">
        </button>`,
      )
      .join("")}</div>
      <p class="car-picker-note">两辆车均已绑定至当前车主账户</p>
      <button class="add-car-button" type="button" id="add-car-demo"><i data-lucide="plus"></i><span>添加车辆</span></button>`,
    afterOpen(root) {
      $$("[data-select-car]", root).forEach((button) => {
        button.addEventListener("click", () => {
          closeSheet();
          updateCar(button.dataset.selectCar);
          showToast(`已切换到 ${button.dataset.selectCar}`);
        });
      });
      $("#add-car-demo", root).addEventListener("click", () => showToast("演示版已预置两辆绑定车辆"));
    },
  });
}

function handleAction(action) {
  const actions = {
    "test-drive": () =>
      formSheet({
        kicker: "预约试驾",
        title: "安排一次心动体验",
        fields: [
          { id: "dealer", label: "体验中心", type: "select", options: ["上海浦东保时捷中心", "上海闵行保时捷中心", "杭州滨江保时捷中心"] },
          { id: "date", label: "期望日期", type: "date", required: true },
          { id: "phone", label: "联系电话", type: "tel", placeholder: "请输入手机号", required: true },
        ],
        submitLabel: "提交预约",
        onSubmit: () => showToast("预约信息已保存到本地演示"),
      }),
    configure: () =>
      openSheet({
        kicker: "在线配置",
        title: "定制你的 Panamera",
        content: `<p class="sheet-copy">从车身颜色、轮毂到内饰材质，组合一台属于你的 Panamera。</p><div class="sheet-options"><button class="sheet-option" type="button" data-option="车漆"><i data-lucide="palette"></i><span><b>车身颜色</b><small>当前：火山灰金属漆</small></span><i data-lucide="chevron-right"></i></button><button class="sheet-option" type="button" data-option="轮毂"><i data-lucide="circle-dot"></i><span><b>轮毂</b><small>当前：21 英寸黑色轮毂</small></span><i data-lucide="chevron-right"></i></button><button class="sheet-option" type="button" data-option="内饰"><i data-lucide="armchair"></i><span><b>内饰</b><small>当前：波尔多红真皮</small></span><i data-lucide="chevron-right"></i></button></div>`,
        afterOpen(root) {
          $$("[data-option]", root).forEach((button) =>
            button.addEventListener("click", () => showToast(`${button.dataset.option}配置器将在接入车型库后启用`)),
          );
        },
      }),
    models: () => navigate("featured"),
    shop: () => showToast("精选商城为演示入口"),
    topics: () => showToast("热门话题列表为演示入口"),
    topic: () => showToast("#保时捷声动时刻 为演示话题"),
    compose: () =>
      formSheet({
        kicker: "发布话题",
        title: "记录此刻",
        fields: [{ id: "note", label: "说点什么", placeholder: "分享你的驾驶故事", required: true }],
        submitLabel: "保存到本地",
        onSubmit: () => showToast("内容已保存在当前演示会话"),
      }),
    story: () => showToast("车主故事为演示内容"),
    search: () =>
      openSheet({
        kicker: "车型搜索",
        title: "寻找你的下一台保时捷",
        content: `<form class="sheet-form" id="search-form"><div class="field"><label for="search-input">车型或关键词</label><input id="search-input" type="search" placeholder="Panamera、Cayenne、纯电"></div><button class="button button-dark" type="submit">开始搜索</button></form>`,
        afterOpen(root) {
          $("#search-form", root).addEventListener("submit", (event) => {
            event.preventDefault();
            const value = $("#search-input", root).value.trim();
            closeSheet();
            if (value) showToast(`“${value}”的搜索结果将在接入车型库后显示`);
          });
        },
      }),
    "switch-vehicle": selectCarSheet,
    garage: selectCarSheet,
    "vehicle-info": () =>
      openSheet({
        kicker: "已绑定车辆",
        title: "车辆详细信息",
        content: `<div class="vehicle-detail-hero"><img src="${cars[state.car].image}" alt="${state.car}"><h3>${state.car}</h3></div>
          <div class="detail-list">
            <button class="detail-row" type="button"><span>VIN</span><b>${cars[state.car].vin}</b><i data-lucide="eye"></i></button>
            <button class="detail-row" type="button"><span>车牌</span><b>去添加</b><i data-lucide="chevron-right"></i></button>
            <button class="detail-row" type="button"><span>共同用车人</span><b>去添加</b><i data-lucide="chevron-right"></i></button>
          </div>`,
        afterOpen(root) {
          $$("[data-detail-edit]", root).forEach((button) => {
            button.addEventListener("click", () => showToast("演示版不修改车辆绑定信息"));
          });
        },
      }),
    "vehicle-status": () =>
      openSheet({
        kicker: "车辆状态",
        title: "一切正常",
        content: `<p class="sheet-copy">轮胎、制动系统与电池电压均处于正常范围。演示数据仅用于界面展示，不连接真实车辆。</p><div class="sheet-actions"><button class="button button-dark" type="button" data-close-sheet>知道了</button></div>`,
      }),
    lock: () => {
      state.locked = !state.locked;
      $("#lock-card").classList.toggle("is-unlocked", !state.locked);
      $("#lock-label").textContent = "锁止/解锁";
      showToast(state.locked ? "车辆已锁止" : "车辆已解锁");
    },
    scan: () => showToast("扫描车辆功能为演示入口"),
    functions: () => showToast("车辆功能菜单为演示入口"),
    flash: () => showToast("已发送闪灯指令"),
    honk: () => showToast("已发送鸣笛指令"),
    climate: () =>
      openSheet({
        kicker: "远程控制",
        title: "座舱空调",
        content: `<div class="climate-dial"><strong>22°</strong><span>座舱温度</span></div><p class="sheet-copy">当前设定温度 22°C，座舱通风已开启。</p><div class="sheet-actions"><button class="button button-dark" type="button" id="climate-start">启动空调</button><button class="button" type="button" data-close-sheet style="border:1px solid #e4e4e2;background:#fff">取消</button></div>`,
        afterOpen(root) {
          $("#climate-start", root).addEventListener("click", () => {
            closeSheet();
            showToast("已发送启动空调指令");
          });
        },
      }),
    locate: () => showToast("车辆位于演示位置：上海浦东"),
    charge: () => showToast("当前车辆为燃油车型"),
    history: () =>
      openSheet({
        kicker: "行程记录",
        title: "最近行程",
        content: `<div class="sheet-options"><button class="sheet-option" type="button"><i data-lucide="map-pin"></i><span><b>上海 · 浦东</b><small>今天 02:51 · 18.4 km</small></span></button><button class="sheet-option" type="button"><i data-lucide="map-pin"></i><span><b>上海 · 徐汇</b><small>昨天 19:22 · 12.8 km</small></span></button><button class="sheet-option" type="button"><i data-lucide="map-pin"></i><span><b>杭州 · 滨江</b><small>10 月 28 日 · 176.2 km</small></span></button></div>`,
      }),
    advisor: () =>
      openSheet({
        kicker: "专属服务",
        title: "联系服务顾问",
        content: `<p class="sheet-copy">服务时间 09:00 - 21:00。演示版不会拨打真实电话，也不会上传联系方式。</p><div class="sheet-actions"><button class="button button-dark" type="button" id="advisor-contact">联系在线顾问</button><button class="button" type="button" data-close-sheet style="border:1px solid #e4e4e2;background:#fff">稍后</button></div>`,
        afterOpen(root) {
          $("#advisor-contact", root).addEventListener("click", () => {
            closeSheet();
            showToast("在线顾问为演示入口");
          });
        },
      }),
    maintenance: () =>
      formSheet({
        kicker: "保养预约",
        title: "安排车辆保养",
        fields: [
          { id: "center", label: "服务门店", type: "select", options: ["上海浦东保时捷中心", "上海闵行保时捷中心"] },
          { id: "date", label: "预约日期", type: "date", required: true },
        ],
        submitLabel: "确认预约",
        onSubmit: () => showToast("保养预约已保存到本地演示"),
      }),
    insurance: () => showToast("保险保障状态：正常"),
    roadside: () => showToast("道路救援 24 小时在线"),
    charging: () => showToast("附近充电站为演示入口"),
    benefits: () =>
      openSheet({
        kicker: "车主权益",
        title: "Panamera 专属礼遇",
        content: `<div class="sheet-options"><button class="sheet-option" type="button"><i data-lucide="gem"></i><span><b>专属保养礼遇</b><small>有效期至 2026 年 12 月 31 日</small></span></button><button class="sheet-option" type="button"><i data-lucide="ticket"></i><span><b>车主活动优先预约</b><small>本月可用</small></span></button></div>`,
      }),
    benefit: () => handleAction("benefits"),
    messages: () =>
      openSheet({
        kicker: "消息中心",
        title: "暂无新消息",
        content: `<p class="sheet-copy">车辆提醒、服务进度与车主活动通知会出现在这里。</p><div class="sheet-actions"><button class="button button-dark" type="button" data-close-sheet>返回</button></div>`,
      }),
    settings: () =>
      openSheet({
        kicker: "账户设置",
        title: "个人设置",
        content: `<div class="sheet-options"><button class="sheet-option" type="button" data-setting="name"><i data-lucide="user-round"></i><span><b>修改称呼</b><small>${state.owner}</small></span><i data-lucide="chevron-right"></i></button><button class="sheet-option" type="button" data-setting="notify"><i data-lucide="bell"></i><span><b>消息通知</b><small>车辆与服务提醒</small></span><i data-lucide="chevron-right"></i></button><button class="sheet-option" type="button" data-setting="about"><i data-lucide="info"></i><span><b>关于此版本</b><small>本地复原版 · 无卡密</small></span><i data-lucide="chevron-right"></i></button></div>`,
        afterOpen(root) {
          $$("[data-setting]", root).forEach((button) => {
            button.addEventListener("click", () => {
              if (button.dataset.setting === "name") {
                closeSheet();
                handleAction("edit-name");
              } else if (button.dataset.setting === "notify") {
                showToast("消息通知已开启");
              } else {
                showToast("复原版 1.0 · 所有数据保存在本地");
              }
            });
          });
        },
      }),
    "edit-name": () =>
      formSheet({
        kicker: "个人资料",
        title: "修改称呼",
        fields: [{ id: "owner", label: "称呼", value: state.owner, required: true }],
        submitLabel: "保存",
        onSubmit(values) {
          state.owner = values.owner.trim() || state.owner;
          $("#owner-name").textContent = state.owner;
          showToast("称呼已更新");
        },
      }),
    club: () => showToast("车主俱乐部为演示入口"),
    posts: () => showToast("还没有发布内容"),
    favorites: () => showToast("收藏夹为空"),
    follows: () => showToast("暂未关注其他车主"),
    fans: () => showToast("粉丝列表为空"),
    orders: () => showToast("订单列表为空"),
    appointments: () => showToast("暂无待处理预约"),
    coupons: () => showToast("卡券包为空"),
    events: () => showToast("暂无报名中的活动"),
    gifts: () => showToast("礼物中心为演示入口"),
    badges: () => showToast("尚未获得勋章"),
    footprints: () => showToast("浏览记录为空"),
    journey: () => showToast("共行 · 致远"),
  };

  if (actions[action]) {
    actions[action]();
  }
}

$$(".nav-item").forEach((button) => {
  button.addEventListener("click", () => navigate(button.dataset.nav));
});

$$("[data-profile-car]").forEach((button) => {
  button.addEventListener("click", () => {
    const nextCar = button.dataset.profileCar === "911" ? "911 Carrera" : "Cayenne 铂金版";
    updateCar(nextCar);
  });
});

$$(".discover-tab").forEach((button) => {
  button.addEventListener("click", () => {
    const data = discoveryData[button.dataset.discovery];
    $$(".discover-tab").forEach((tab) => {
      const active = tab === button;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    $("#discovery-kicker").textContent = data.kicker;
    $("#discovery-title").textContent = data.title;
    $("#discovery-subtitle").textContent = data.subtitle;
    $("#discovery-action").textContent = data.action;
    $$(".carousel-dots span").forEach((dot, index) => {
      dot.classList.toggle("is-active", index === ["recommend", "community", "activity"].indexOf(button.dataset.discovery));
    });
  });
});

$("#discovery-action").addEventListener("click", () => {
  const currentTab = $(".discover-tab.is-active").dataset.discovery;
  if (currentTab === "recommend") navigate("vehicle");
  else if (currentTab === "community") showToast("社区入口为演示内容");
  else handleAction("events");
});

$$(".chip").forEach((button) => {
  button.addEventListener("click", () => {
    $$(".chip").forEach((chip) => chip.classList.toggle("is-active", chip === button));
    const filter = button.dataset.filter;
    $$(".model-row").forEach((row) => {
      const model = row.dataset.model;
      const visible =
        filter === "all" ||
        (filter === "sport" && ["Panamera", "911"].includes(model)) ||
        (filter === "suv" && model === "Cayenne") ||
        (filter === "electric" && model === "Taycan");
      row.hidden = !visible;
    });
  });
});

$$(".model-row").forEach((button) => {
  button.addEventListener("click", () => {
    const model = button.dataset.model;
    if (model === "911") {
      updateCar("911 Carrera");
      return;
    }
    if (model === "Cayenne") {
      updateCar("Cayenne 铂金版");
      return;
    }
    openSheet({
      kicker: "车型详情",
      title: model,
      content: `<p class="sheet-copy">${model} 的完整配置与库存信息将在接入车型库后显示。</p><div class="sheet-actions"><button class="button button-dark" type="button" id="model-test-drive">预约试驾</button><button class="button" type="button" data-close-sheet style="border:1px solid #e4e4e2;background:#fff">返回</button></div>`,
      afterOpen(root) {
        $("#model-test-drive", root).addEventListener("click", () => {
          closeSheet();
          handleAction("test-drive");
        });
      },
    });
  });
});

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-sheet]")) {
    closeSheet();
    return;
  }
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) {
    const action = actionButton.dataset.action;
    handleAction(action);
    return;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !$("#sheet-layer").hidden) closeSheet();
});

navigate("vehicle");
refreshIcons();

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

// main.js - 메인 자바스크립트

// 페이지 로드 후 실행
document.addEventListener("DOMContentLoaded", function () {
  // 사용자 데이터 초기화
  initUserData();

  // 메뉴 항목 이벤트 처리
  setupMenuNavigation();

  // 창 컨트롤 이벤트 처리
  setupWindowControls();

  // 메시지 이벤트 처리 (iframe과 통신)
  setupMessageEventListeners();

  // 랜덤 알림 시뮬레이션
  setupRandomNotifications();

  // 온라인 사용자 시뮬레이션
  simulateOnlineUsers();
});

// 사용자 데이터 초기화
function initUserData() {
  // 로컬 스토리지에서 사용자 데이터 가져오기
  let userData = localStorage.getItem("coffeeCmdUserData");

  // 기본 사용자 데이터
  const defaultUserData = {
    username: "게스트",
    level: 3,
    exp: 340,
    expMax: 500,
    points: 127,
    notifications: 3,
    lastLogin: new Date().toISOString(),
    interests: ["JavaScript", "React", "UX/UI", "커피", "여행"],
    achievements: [],
    settings: {
      theme: "default",
      notifications: true,
      sounds: true,
    },
  };

  // 데이터가 없으면 기본 데이터 저장
  if (!userData) {
    localStorage.setItem("coffeeCmdUserData", JSON.stringify(defaultUserData));
    userData = defaultUserData;
  } else {
    userData = JSON.parse(userData);
  }

  // 사용자 정보 업데이트
  updateUserStatus(userData);

  // 전역 변수로 사용자 데이터 저장
  window.userData = userData;
}

// 사용자 상태 표시 업데이트
function updateUserStatus(userData) {
  const userStatus = document.getElementById("userStatus");
  userStatus.innerHTML = `사용자: ${userData.username} | 레벨: Lv.${userData.level} | 활동점수: ${userData.points}`;

  const notificationCount = document.getElementById("notificationCount");
  notificationCount.textContent = userData.notifications;
}

// 메뉴 네비게이션 설정
function setupMenuNavigation() {
  const menuItems = document.querySelectorAll(".menu-item");
  const contentFrame = document.getElementById("contentFrame");

  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      // 활성 메뉴 아이템 업데이트
      menuItems.forEach((menuItem) => menuItem.classList.remove("active"));
      this.classList.add("active");

      // 해당 페이지 로드
      const screenId = this.getAttribute("data-screen");
      contentFrame.src = `pages/${screenId}.html`;

      // 알림 업데이트
      if (screenId === "home") {
        // 홈으로 돌아오면 알림 초기화
        window.userData.notifications = 0;
        updateUserStatus(window.userData);
        localStorage.setItem(
          "coffeeCmdUserData",
          JSON.stringify(window.userData)
        );
      }
    });
  });
}

// 창 컨트롤 설정
function setupWindowControls() {
  // 닫기 버튼
  document.querySelector(".close").addEventListener("click", function () {
    const confirmed = confirm("커피CMD를 종료하시겠습니까?");
    if (confirmed) {
      document.body.innerHTML =
        '<div style="display:flex;justify-content:center;align-items:center;height:100vh;color:#0f0;background:#000;font-family:\'D2Coding\',monospace;">커피CMD가 종료되었습니다. <a href="index.html" style="color:#0f0;text-decoration:underline;margin-left:10px;">재시작</a></div>';
    }
  });

  // 최소화 버튼
  document.querySelector(".minimize").addEventListener("click", function () {
    document.querySelector(".main-content").style.display = "none";
    document.querySelector(".status-bar").style.display = "none";

    // 최소화 알림 표시
    showNotification(
      "커피CMD가 최소화되었습니다. 클릭하여 복원하세요.",
      "info",
      () => {
        document.querySelector(".main-content").style.display = "flex";
        document.querySelector(".status-bar").style.display = "flex";
      }
    );
  });

  // 최대화 버튼
  document.querySelector(".maximize").addEventListener("click", function () {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch((e) => {
        showNotification("전체 화면 모드 전환에 실패했습니다.", "error");
      });
    }
  });
}

// iframe과의 메시지 통신 설정
function setupMessageEventListeners() {
  window.addEventListener("message", function (event) {
    const message = event.data;

    switch (message.action) {
      case "notification":
        showNotification(message.text, message.type);
        break;

      case "updateUser":
        // 사용자 데이터 업데이트
        window.userData = { ...window.userData, ...message.userData };
        updateUserStatus(window.userData);
        localStorage.setItem(
          "coffeeCmdUserData",
          JSON.stringify(window.userData)
        );
        break;

      case "openModal":
        openModal(message.title, message.content, message.buttons);
        break;

      case "closeModal":
        closeModal();
        break;

      case "navigate":
        // 다른 페이지로 이동
        document.querySelector(`[data-screen="${message.screen}"]`).click();
        break;

      case "getUser":
        // iframe에 사용자 데이터 전송
        const contentFrame = document.getElementById("contentFrame");
        contentFrame.contentWindow.postMessage(
          {
            action: "userData",
            userData: window.userData,
          },
          "*"
        );
        break;
    }
  });
}

// 알림 표시
function showNotification(text, type = "info", onClick = null) {
  const notificationArea = document.getElementById("notification-area");
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = text;

  if (onClick) {
    notification.style.cursor = "pointer";
    notification.addEventListener("click", onClick);
  }

  notificationArea.appendChild(notification);

  // 페이드 인
  setTimeout(() => {
    notification.style.opacity = "1";
  }, 10);

  // 3초 후 자동 제거
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      notificationArea.removeChild(notification);
    }, 300);
  }, 3000);
}

// 모달 창 열기
function openModal(title, content, buttons = []) {
  const modalContainer = document.getElementById("modal-container");
  modalContainer.innerHTML = "";
  modalContainer.classList.remove("hidden");

  const modal = document.createElement("div");
  modal.className = "modal";

  // 모달 헤더
  const modalHeader = document.createElement("div");
  modalHeader.className = "modal-header";

  const modalTitle = document.createElement("div");
  modalTitle.className = "modal-title";
  modalTitle.textContent = title;

  const modalClose = document.createElement("div");
  modalClose.className = "modal-close";
  modalClose.textContent = "×";
  modalClose.addEventListener("click", closeModal);

  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(modalClose);

  // 모달 내용
  const modalBody = document.createElement("div");
  modalBody.className = "modal-body";
  modalBody.innerHTML = content;

  // 모달 푸터 (버튼)
  const modalFooter = document.createElement("div");
  modalFooter.className = "modal-footer";

  buttons.forEach((button) => {
    const btn = document.createElement("button");
    btn.className = `modal-btn ${button.type || ""}`;
    btn.textContent = button.text;

    if (button.action) {
      btn.addEventListener("click", () => {
        const result = button.action();
        if (result !== false) {
          closeModal();
        }
      });
    } else {
      btn.addEventListener("click", closeModal);
    }

    modalFooter.appendChild(btn);
  });

  // 모달 조립
  modal.appendChild(modalHeader);
  modal.appendChild(modalBody);

  if (buttons.length > 0) {
    modal.appendChild(modalFooter);
  }

  modalContainer.appendChild(modal);

  // ESC 키로 모달 닫기
  document.addEventListener("keydown", handleModalKeydown);
}

// 키보드 이벤트 처리 (모달용)
function handleModalKeydown(e) {
  if (e.key === "Escape") {
    closeModal();
  }
}

// 모달 창 닫기
function closeModal() {
  const modalContainer = document.getElementById("modal-container");
  modalContainer.classList.add("hidden");

  document.removeEventListener("keydown", handleModalKeydown);
}

// 랜덤 알림 시뮬레이션
function setupRandomNotifications() {
  const notifications = [
    "새로운 매칭 요청이 도착했습니다.",
    "김개발님이 메시지를 보냈습니다.",
    "박디자이너님이 커피챗 일정을 제안했습니다.",
    "최마케터님이 귀하의 프로필을 방문했습니다.",
    "이창업님이 커뮤니티에 새 글을 작성했습니다.",
    "귀하의 관심사와 일치하는 새 멘토가 등록되었습니다.",
    "서울 강남구에 새로운 추천 카페가 추가되었습니다.",
    "레벨 업까지 경험치가 10 남았습니다!",
  ];

  // 10분에 한 번씩 랜덤 알림 생성
  setInterval(() => {
    if (window.userData.settings.notifications) {
      const randomNotification =
        notifications[Math.floor(Math.random() * notifications.length)];

      window.userData.notifications++;
      updateUserStatus(window.userData);
      localStorage.setItem(
        "coffeeCmdUserData",
        JSON.stringify(window.userData)
      );

      showNotification(randomNotification);
    }
  }, 600000); // 10분
}

// 온라인 사용자 수 시뮬레이션
function simulateOnlineUsers() {
  const onlineUsers = document.getElementById("onlineUsers");
  let count = parseInt(onlineUsers.textContent);

  // 30초마다 온라인 사용자 수 변경
  setInterval(() => {
    // -3~+5 범위내 랜덤 변화
    const change = Math.floor(Math.random() * 9) - 3;
    count = Math.max(500, count + change);
    onlineUsers.textContent = count.toLocaleString();
  }, 30000); // 30초
}

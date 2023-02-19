const isMobile = (() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
})();

class BottomSheet extends HTMLElement {
  constructor() {
    super();

    this.setAttribute("aria-hidden", true);
    this.contentId = this.getAttribute("id");
    this.isClose = this.getAttribute("isClose")
      ? this.getAttribute("isClose")
      : true;

    this.defaultVh = 0;
    this.beforeVh = 0;
    this.sheetHeight; // in vh
    this.sheetWrapper; // .sheet__wrapper
  }

  connectedCallback() {
    this.renderBottomSheet();
    // DOM에 추가되었다. 렌더링 등의 처리를 하자.
  }

  disconnectedCallback() {
    // DOM에서 제거되었다. 엘리먼트를 정리하는 일을 하자.
  }

  renderBottomSheet() {
    this.id = `${this.contentId}`;
    this.className = "customBottomsheet";
    if (!isMobile) {
      this.classList.add("__modal");
    }

    const overlayDiv = document.createElement("div");
    overlayDiv.className = "overlay";

    const sheetWrapperDiv = document.createElement("div");
    sheetWrapperDiv.className = "sheet__wrapper";

    const headerDiv = document.createElement("header");
    headerDiv.className = "controls";
    headerDiv.innerHTML = `
        <div class="draggable__area">
          <div class="draggable__thumb"></div>
        </div>
        <div class="title__wrapper">
          <span class="title">${this.getAttribute("title")}</span>
          ${
            this.isClose
              ? `<button type="button" class="close__btn">✕</button>`
              : ``
          }
        </div>
      `;

    const contentDiv = this.querySelector(`#${this.contentId} > main`);
    contentDiv.className = `${contentDiv.className} content`;

    sheetWrapperDiv.appendChild(headerDiv);
    sheetWrapperDiv.appendChild(contentDiv);

    this.appendChild(overlayDiv);
    this.appendChild(sheetWrapperDiv);

    this.defaultVh =
      Number((sheetWrapperDiv.offsetHeight / window.innerHeight) * 100) < 65
        ? Number((sheetWrapperDiv.offsetHeight / window.innerHeight) * 100)
        : 65;
    this.beforeVh = this.defaultVh;
    this.sheetWrapper = this.querySelector(".sheet__wrapper");

    if (this.isClose) {
      this.querySelector(".close__btn").addEventListener("click", () => {
        this.closeSheet();
      });
    }

    this.querySelector(".overlay").addEventListener("click", () => {
      this.closeSheet();
    });

    if (isMobile) {
      const draggableArea = this.querySelector(".draggable__area");

      const touchPosition = (event) => {
        return event.touches ? event.touches[0] : event;
      };

      let dragPosition;

      const onDragStart = (event) => {
        dragPosition = touchPosition(event).pageY;
        sheetWrapperDiv.classList.add("not-selectable");
        draggableArea.style.cursor = document.body.style.cursor = "grabbing";
      };

      const onDragMove = (event) => {
        if (dragPosition === undefined) return;

        const y = touchPosition(event).pageY;
        const deltaY = dragPosition - y;
        const deltaHeight = (deltaY / window.innerHeight) * 100;

        this.setSheetHeight(this.sheetHeight + deltaHeight);
        dragPosition = y;
      };

      const onDragEnd = () => {
        dragPosition = undefined;
        sheetWrapperDiv.classList.remove("not-selectable");
        draggableArea.style.cursor = document.body.style.cursor = "";
        if (this.beforeVh - 5 > this.sheetHeight) {
          this.setIsSheetShown(false);
        } else if (this.sheetHeight < this.defaultVh - 10) {
          this.setIsSheetShown(false);
        } else if (this.sheetHeight > this.defaultVh + 10) {
          this.setSheetHeight(100);
        } else {
          this.setSheetHeight(this.defaultVh);
        }
        this.beforeVh = this.sheetHeight;
      };

      draggableArea.addEventListener("mousedown", onDragStart);
      draggableArea.addEventListener("touchstart", onDragStart);

      this.addEventListener("mousemove", onDragMove);
      this.addEventListener("touchmove", onDragMove);

      this.addEventListener("mouseup", onDragEnd);
      this.addEventListener("touchend", onDragEnd);
    }
  }

  setSheetHeight(value) {
    if (!isMobile) {
      this.sheetWrapper.classList.add("fullscreen");
      return;
    }
    this.sheetHeight = Math.max(0, Math.min(100, value));
    this.sheetWrapper.style.height = `${this.sheetHeight}vh`;

    if (this.sheetHeight === 100) {
      this.sheetWrapper.classList.add("fullscreen");
    } else {
      this.sheetWrapper.classList.remove("fullscreen");
    }
  }

  setIsSheetShown(value) {
    this.setAttribute("aria-hidden", String(!value));
    if (!value) {
      document.body.classList.remove("no-scroll");
    } else {
      document.body.classList.add("no-scroll");
    }
  }

  openSheet() {
    this.beforeVh = 0;
    this.setSheetHeight(this.defaultVh);
    this.setIsSheetShown(true);
  }

  closeSheet() {
    this.setIsSheetShown(false);
    this.setSheetHeight(this.defaultVh);
  }

  fullSheet() {
    this.beforeVh = 100;
    this.setSheetHeight(100);
  }
}
document.addEventListener("DOMContentLoaded", function () {
  customElements.define("bottom-sheet", BottomSheet);
});

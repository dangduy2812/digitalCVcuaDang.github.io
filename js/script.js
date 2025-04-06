function handleSubmit() {
  const emailValue = document.getElementById("email").value.toLowerCase();
  // `.value` truy cập giá trị hiện tại của trường.
  const errorEmail = document.getElementById("error-email");
  const regex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  // - `^`: Bắt đầu chuỗi.
  // - `(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))`: Khớp với phần tên người dùng của email.
  // - `@`: Khớp với ký tự "@".
  // - `(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})`: Khớp với phần tên miền của email.
  // - `$`: Kết thúc chuỗi.
  // - `/i`: Cờ cho biết việc so khớp không phân biệt chữ hoa chữ thường (mặc dù chúng ta đã chuyển đổi `emailValue` thành chữ thường).
  const check = emailValue.match(regex);
  // Sử dụng phương thức `.match()` của chuỗi để kiểm tra xem `emailValue` có khớp với biểu thức chính quy `checkEmail` hay không.

  const sectionContent = document.querySelector(".personal-info");
  console.log("check section", sectionContent);
  // lấy element để kiểm soát submit
  const submitControl = document.querySelector(".submit-email");
  if (check) {
    sectionContent.style.display = "block";
    submitControl.style.display = "none";
    errorEmail.innerHTML = "";
  } else {
    errorEmail.innerHTML = "vui lòng nhập đúng định dạng Email.";
  }
}
// innerHTML: là một thuộc tính của phần tử HTML, giúp truy cập hoặc thay đổi nội dung bên trong nó.

function handleOnMouseOver(element) {
  const viewMore = element.querySelector(".view-more");
  viewMore.style.display = "inline-block";
}

function handleOnMouseOut(element) {
  const viewMore = element.querySelector(".view-more");
  viewMore.style.display = "none";
}

function handleViewMore(element) {
  const parentElement = element.closest(".parent");
  if (!parentElement) return;

  const viewMore = parentElement.querySelector(".view-more, .view-less");
  if (!viewMore) return;

  const sectionContents = parentElement.querySelectorAll(".resume-content");
  if (sectionContents.length === 0) return;

  // Xác định trạng thái hiện tại
  const isExpanding = viewMore.classList.contains("view-more");

  // Hiển thị hoặc ẩn nội dung
  sectionContents.forEach((el) => {
    if (el.classList.contains("interests")) {
      el.style.display = isExpanding ? "flex" : "none";
      el.style.flexWrap = "wrap";
      el.style.gap = "15px";
    } else {
      el.style.display = isExpanding ? "block" : "none";
    }
  });

  // Đổi class của nút
  viewMore.classList.toggle("view-more", !isExpanding);
  viewMore.classList.toggle("view-less", isExpanding);

  // Cập nhật nội dung nút
  viewMore.innerHTML = isExpanding ? "View Less ▲" : "View More ▼";
}

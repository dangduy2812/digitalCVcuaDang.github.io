# CV Portfolio Hub

Hệ thống quản lý **nhiều CV** trên một website tĩnh (GitHub Pages). Mỗi CV nằm trong **repo riêng** dưới `repo/repo_CV_<Tên>/` — tách biệt dữ liệu để export và push **1 repo = 1 CV** cho nhà tuyển dụng mà không lộ CV khác.

## Link trực tuyến

| Mục đích | Link | Ghi chú |
|----------|------|---------|
| **Hub quản lý** (cá nhân) | https://dangduy2812.github.io/digitalCVcuaDang.github.io/ | Chứa editor + danh sách CV — **không gửi link này cho NTD** |
| **CV Java — gửi NTD** | https://dangduy2812.github.io/cv-java-software-engineer/ | Chỉ 1 CV Software Engineer, không có hub |
| Xem CV Java trên hub | https://dangduy2812.github.io/digitalCVcuaDang.github.io/cv.html?id=java | Preview trước khi export |

> Repo GitHub CV standalone: https://github.com/dangduy2812/cv-java-software-engineer

## Hai tầng kiến trúc

| Tầng | Thư mục | Vai trò |
|------|---------|---------|
| **Master (hub)** | `CV_master_*`, `index.html`, `cv.html`, `editor.html` | Quản lý tất cả CV, engine render, editor |
| **CV repo** | `repo/repo_CV_<Tên>/` | Dữ liệu + media của từng CV, độc lập |

Master **chỉ đọc/ghi** qua `CV_master_registry.json` và thư mục `repo/` — không trộn dữ liệu CV vào engine.

## Trải nghiệm nhanh

| Trang | Vai trò |
|-------|---------|
| `index.html` | Hub: liệt kê mọi CV, link sang từng CV và editor |
| `cv.html?id=<id>` | Render CV từ `repo/repo_CV_<Tên>/cv.json` |
| `editor.html` | Editor trực quan + Export |

## Cấu trúc thư mục

```
index.html                  # Hub (giữ ở root — GitHub Pages)
cv.html
editor.html
CV_master_registry.json     # Manifest danh sách CV

CV_master_js/               # Engine hub + render + editor
CV_master_css/
CV_master_fonts/

repo/
  repo_CV_Java/             # ← 1 CV = 1 thư mục repo
    cv.json
    CV_Java_images/
    CV_Java_demos/
    CV_Java_assets/
    deploy/                 # Output export (gitignored)
  repo_CV_<Tên>/            # CV khác — thêm tương tự

scripts/
  export-standalone.ps1
archive/                    # File cũ (legacy)
```

## Quy ước đặt tên

| Thành phần | Quy ước | Ví dụ Java |
|------------|---------|------------|
| Thư mục repo | `repo/repo_CV_<PascalCase>` | `repo/repo_CV_Java` |
| Ảnh | `CV_<Id>_images/` | `CV_Java_images/` |
| Demo | `CV_<Id>_demos/` | `CV_Java_demos/` |
| File tải (PDF) | `CV_<Id>_assets/` | `CV_Java_assets/` |
| ID logic (URL) | slug ngắn | `java` |

## Quản lý tất cả CV (repo master)

1. Mở `editor.html` hoặc **New CV** trên hub.
2. Nhập **CV ID** (slug, ví dụ `embedded`).
3. Chỉnh nội dung, bật/tắt section.
4. **Export CV** → lưu `cv.json` vào `repo/repo_CV_<Id>/cv.json`.
5. Thêm ảnh/PDF/demo vào `CV_<Id>_images/`, `CV_<Id>_assets/`, `CV_<Id>_demos/`.
6. **Export registry** → cập nhật `CV_master_registry.json`.
7. Commit & push repo master (có thể **private**).

## Gửi cho nhà tuyển dụng (1 repo riêng)

```powershell
# 1. Export site độc lập
.\scripts\export-standalone.ps1 -Id java

# 2. Tạo repo trống trên GitHub: cv-java-software-engineer (public, không README)
# 3. Push thư mục deploy
cd repo/repo_CV_Java/deploy
git init
git add .
git commit -m "CV Software Engineer"
git branch -M main
git remote add origin https://github.com/dangduy2812/cv-java-software-engineer.git
git push -u origin main
```

Sau đó bật **Settings → Pages → branch `main` / root** trên repo `cv-java-software-engineer`.

**Link gửi NTD:** https://dangduy2812.github.io/cv-java-software-engineer/

Mỗi lần sửa CV: chạy lại bước 1, rồi `git add . && git commit -m "update" && git push` trong `deploy/`.

Chi tiết: [`repo/repo_CV_Java/README.md`](repo/repo_CV_Java/README.md)

## Đường dẫn trong `cv.json`

Luôn **tương đối** trong thư mục repo CV:

```json
"avatar": "CV_Java_images/default-avatar.png",
"cvPdf": "CV_Java_assets/Nguyen-Phan-DuyDang-Software_Engineer.pdf",
"demo": "CV_Java_demos/vehicle-api.html"
```

## Chạy thử cục bộ

```bash
python -m http.server 8000
# http://localhost:8000
```

> Cần HTTP server — demo dùng path tuyệt đối `/CV_master_*`.

## GitHub Pages

`index.html`, `cv.html`, `editor.html` giữ ở **thư mục gốc** để GitHub Pages hoạt động mặc định. Nếu sau này gom hub vào subfolder, cần đổi Settings → Pages → folder.

## Schema JSON

Xem `repo/repo_CV_Java/cv.json` làm mẫu. Trường văn bản: chuỗi hoặc `{ "en": "...", "vi": "..." }`.

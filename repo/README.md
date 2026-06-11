# Thư mục CV repos (`repo/`)

Mỗi CV là **một thư mục con độc lập**. Hub master quản lý qua `CV_master_registry.json` ở thư mục gốc.

```
repo/
  repo_CV_Java/           # CV Software Engineer
    cv.json
    CV_Java_images/
    CV_Java_demos/
    CV_Java_assets/
    deploy/               # Build output (gitignored)
  repo_CV_<Tên>/          # CV khác
```

## Thêm CV mới

1. Tạo `repo/repo_CV_<Tên>/` với `cv.json`, `CV_<Id>_images/`, …
2. Thêm mục vào `CV_master_registry.json` (có `id`, `repoFolder`, `thumbnail`, …)
3. CV xuất hiện trên `index.html`

## Quy ước đặt tên

| Thành phần | Quy ước |
|------------|---------|
| Thư mục repo | `repo_CV_<PascalCase>` |
| Ảnh | `CV_<Id>_images/` |
| Demo | `CV_<Id>_demos/` |
| PDF / file tải | `CV_<Id>_assets/` |

## Repo master vs repo gửi NTD

| Mục đích | Repo | Nội dung |
|----------|------|----------|
| Quản lý tất cả CV | Repo master | `index.html`, `editor.html`, `repo/*`, `CV_master_*` |
| Gửi một nhà tuyển dụng | Repo riêng | Chỉ `repo/repo_CV_<Tên>/deploy/` sau export |

```powershell
.\scripts\export-standalone.ps1 -Id java
cd repo/repo_CV_Java/deploy
# git init, push lên repo GitHub Pages mới
```
